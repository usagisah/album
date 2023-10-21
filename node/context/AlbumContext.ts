import type { FSWatcher } from "chokidar"
import type { AlBumServerMode } from "../cli/cli.type.js"
import type { ILogger } from "../modules/logger/logger.type.js"
import type {
  UserConfig,
  AppMode,
  Plugins,
  EnvValue,
  ClientConfig,
  AppStatus,
  ServerConfig,
  AppInputs,
  AppOutputs,
  AppConfigs,
  AppManager,
  PluginFindEntriesParam,
  UserSSRCompose
} from "./AlbumContext.type.js"
import { UserConfig as ViteUserConfig, ViteDevServer } from "vite"

import chokidar from "chokidar"
import { existsSync, rmSync } from "fs"
import { basename, resolve } from "path"
import { EventEmitter } from "events"
import { build as esbuild } from "esbuild"
import { SERVER_EXIT, SERVER_RESTART } from "../constants/constants.js"
import { Logger } from "../modules/logger/logger.js"
import {
  DirStruct,
  PromiseAll,
  callPluginWithCatch,
  isArray,
  isFunction,
  isNumber,
  isPlainObject,
  isString
} from "../utils/utils.js"
import { createEmptyEnvValue, transformEnvValue } from "./process/env.js"
import { SSRCompose } from "./types/ssrCompose.type.js"

export class AlbumContext {
  constructor(
    public app: string,
    public serverMode: AlBumServerMode,
    public mode: AppMode
  ) {}

  inputs: AppInputs
  outputs: AppOutputs
  configs: AppConfigs
  manager: AppManager = {} as any
  status: AppStatus = { ssr: false, env: {} }
  signal = { SERVER_EXIT, SERVER_RESTART }
  logger: ILogger
  watcher: FSWatcher
  plugins: { hooks: Plugins; event: EventEmitter }
  vite: {
    viteConfig: ViteUserConfig
    viteDevServer?: ViteDevServer
  }
  errors: any[] = []

  async normalize(): Promise<[any[], AlbumContext]> {
    try {
      this.inputs = this.buildInputs()

      const logger = (this.logger = new Logger())
      const _userConfig = await this.loadConfig()

      this.plugins = {
        hooks: await this.normalizePlugins(_userConfig.plugins),
        event: this.createPluginEvents()
      }

      const userConfig = await callPluginWithCatch<UserConfig>(
        this.plugins.hooks.config,
        _userConfig,
        e => logger.error("PluginConfig", e, "album")
      )
      this.vite = {
        viteConfig: userConfig.vite ?? {},
        viteDevServer: null
      }
      this.manager = {
        fileManager: new DirStruct({
          name: ".album",
          path: this.inputs.dumpInput
        }),
        clientManager: null,
        serverManager: null
      }

      const [env, clientConfig, serverConfig, ssrCompose] = await PromiseAll([
        transformEnvValue(userConfig.env),
        this.normalizeClientConfig(userConfig.app),
        this.normalizeServerConfig(userConfig.server),
        this.normalizeSSRCompose(userConfig.ssrCompose)
      ])

      this.configs = {
        userConfig,
        clientConfig,
        serverConfig,
        ssrCompose
      }
      this.status.env = this.registryEnv(env, clientConfig.env)
      this.inputs = this.buildInputs()
      this.outputs = this.buildOutputs()
      this.watcher = this.tryWatcher()

      return [this.errors, this]
    } catch (e) {
      this.errors.unshift(e)
      throw new Error(this.errors as any, { cause: "albumContext" })
    }
  }

  buildInputs(): AppInputs {
    if (!this.configs) {
      const cwd = process.cwd()
      return {
        cwd,
        dumpInput: resolve(cwd, ".album")
      } as any
    }
    const {
      inputs,
      configs: { clientConfig }
    } = this
    return {
      cwd: inputs.cwd,
      dumpInput: inputs.dumpInput,
      clientInput: clientConfig.main,
      realClientInput: null,
      ssrInput: clientConfig.mainSSR,
      realSSRInput: null
    }
  }

  async loadConfig(): Promise<UserConfig> {
    const entry = resolve(this.inputs.cwd, "album.config.ts")
    if (!existsSync(entry)) return {}

    const output = resolve(this.inputs.cwd, "_$_album.config.mjs")
    await esbuild({
      entryPoints: [entry],
      format: "esm",
      outfile: output,
      platform: "node"
    })

    let config: any = {}
    try {
      let exports = (await import(output)).default
      if (isFunction(exports)) {
        exports = exports(this.mode, process.argv.slice(2))
      }
      if (isPlainObject(exports)) {
        config = exports
      }
    } catch {
    } finally {
      rmSync(output, { force: true, recursive: true })
    }
    return config
  }

  createPluginEvents() {
    return new EventEmitter()
  }

  async normalizePlugins(plugins: any) {
    if (!isArray(plugins)) plugins = []
    const _plugins: Plugins = {
      config: [],
      findEntries: [],
      context: [],
      specialModule: [],
      initClient: [],
      patchClient: [],
      serverConfig: [],
      server: [],
      onSSREnter: [],
      onStageLog: []
    }
    const keys = Object.getOwnPropertyNames(_plugins)
    const pgs = await Promise.all(plugins.flat(Infinity))
    for (const pg of pgs) {
      if (!isPlainObject(pg)) continue
      for (const key of keys) {
        const fn = pg[key]
        if (fn && isFunction(fn)) {
          _plugins[key].push(fn)
        }
      }
    }
    return _plugins
  }

  async normalizeClientConfig(clientConfig: any) {
    if (!clientConfig) clientConfig = [{}]

    if (!Array.isArray(clientConfig)) {
      throw "配置错误 config.app 配置必须是一个数组"
    }

    let ids = new Set<string>()
    for (const item of clientConfig) {
      if (!isPlainObject(item)) {
        throw "配置错误 [config.app] 是数组时，配置项必须是对象"
      }
      ids.add(item.id + "")
    }
    if (ids.size !== clientConfig.length) {
      throw "配置错误 [config.app] 每项必须携带唯一 id，用于启动参数匹配"
    }

    const conf =
      clientConfig.length === 1
        ? clientConfig[0]
        : clientConfig.find(v => v.id === this.app)

    if (!conf) {
      throw "配置错误 [config.app] 中找不到指定的或默认的启动项"
    }

    if (conf.module && !isPlainObject(conf.module)) {
      throw "配置错误 [config.app.module] 必须是对象"
    }

    const userRouterConfig = isPlainObject(conf.router) ? conf.router : {}
    const _clientConfig: ClientConfig = {
      main: "",
      mainSSR: null,
      module: null,
      env: null,
      router: {
        basename: isString(userRouterConfig.basename)
          ? userRouterConfig.basename
          : ""
      }
    }

    const userConfigModule = conf.module ?? {}
    const { result } = await callPluginWithCatch<PluginFindEntriesParam>(
      this.plugins.hooks.findEntries,
      {
        context: new Map(),
        api: this.plugins.event,
        inputs: this.inputs,
        result: {
          main: conf.main,
          mainSSR: conf.mainSSR,
          module: {
            moduleName: userConfigModule.name,
            modulePath: userConfigModule.path
          },
          appConfig: conf,
          router: _clientConfig.router
        }
      },
      e => this.logger.error("findEntries", e, "album")
    )

    _clientConfig.main = result.main + ""
    _clientConfig.mainSSR = result.mainSSR ? result.mainSSR + "" : null
    _clientConfig.module = result.module

    if (["dev", "build"].includes(this.serverMode)) {
      if (!existsSync(_clientConfig.main)) {
        throw "配置错误 config.app 入口选项(main)不存在"
      }
      if (result.module && !existsSync(_clientConfig.module.modulePath)) {
        throw "配置错误 config.app 入口选项(module)不存在"
      }
      if (_clientConfig.mainSSR && !existsSync(_clientConfig.mainSSR)) {
        throw "配置错误 config.app 入口选项(mainSSR)不存在"
      }
      if (_clientConfig.tsconfig && !existsSync(_clientConfig.tsconfig)) {
        throw "配置错误 config.app 入口选项(tsconfig)不存在"
      }
      if (!isString(_clientConfig.router.basename)) {
        throw "配置错误 config.app.router.name 必须是字符串"
      }
      if (userConfigModule) {
        if (!isPlainObject(_clientConfig.module)) {
          throw "配置错误 config.app.module 必须是对象"
        }
        if (
          !_clientConfig.module.moduleName ||
          !isString(_clientConfig.module.moduleName) ||
          !_clientConfig.module.modulePath ||
          !isString(_clientConfig.module.modulePath)
        ) {
          throw "配置错误 config.app.module[name | path] 必须是字符串"
        }
      }
    }

    if (_clientConfig.mainSSR) {
      this.status.ssr = true
    }

    _clientConfig.env = conf.env
      ? await transformEnvValue(conf.env)
      : createEmptyEnvValue()

    return _clientConfig
  }

  async normalizeServerConfig(serverConfig: any) {
    if (!serverConfig) serverConfig = {}

    const _serverConfig: ServerConfig = {
      port: serverConfig.port ?? 5173
    }

    if (!isNumber(_serverConfig.port)) {
      throw "配置错误 config.port 入口选项(port)不是合法值，需要一个数字"
    }

    return _serverConfig
  }

  async normalizeSSRCompose(
    ssrCompose: UserSSRCompose
  ): Promise<SSRCompose | null> {
    if (!ssrCompose) {
      return null
    }
    if (!ssrCompose) ssrCompose = {}
    if (!isPlainObject(ssrCompose)) {
      throw "配置错误 config.ssrCompose 配置必须是一个对象"
    }

    const _ssrCompose: SSRCompose = {
      root: ""
    }

    const { cwd } = this.inputs
    if (ssrCompose.root) {
      if (!isString(ssrCompose.root)) {
        throw "配置错误 config.ssrCompose.root 配置必须是一个字符串"
      }
      if (!existsSync(resolve(cwd, ssrCompose.root))) {
        throw "配置错误 config.ssrCompose.root 指定的 root 根目录不存在"
      }
      _ssrCompose.root = ssrCompose.root
    } else {
      let _path: string
      if (existsSync((_path = resolve(cwd, "dist")))) {
      } else if (existsSync((_path = resolve(cwd, ".album")))) {
      } else {
        throw "配置错误 config.ssrCompose.root 无法找到满足要求的默认根目录(root)，请手动指定"
      }
      _ssrCompose.root = _path
    }

    return _ssrCompose
  }

  registryEnv(env: EnvValue, userEnv: EnvValue) {
    const _env = {
      ...env.common,
      ...userEnv.common,
      ...env[this.mode],
      ...userEnv[this.mode]
    }
    for (const key in _env) {
      process.env[key] = env[key]
    }
    return _env
  }

  buildOutputs(): AppOutputs {
    const outputs = {
      clientOutDir: "",
      ssrOutDir: ""
    }

    const { cwd } = this.inputs
    const prefix = this.app === "default" ? "dist" : this.app
    const baseOutDir = resolve(cwd, prefix)
    if (this.status.ssr) {
      outputs.clientOutDir = resolve(baseOutDir, prefix, "client")
      outputs.ssrOutDir = resolve(baseOutDir, prefix, "server")
    } else {
      outputs.clientOutDir = resolve(baseOutDir, prefix)
    }
    return outputs
  }

  tryWatcher() {
    if (!["dev"].includes(this.serverMode)) {
      return
    }

    const modulePath = this.configs.clientConfig.module?.modulePath
    const configPath = resolve(this.inputs.cwd, "album.config.ts")
    const watcher = chokidar.watch(
      [configPath].concat(modulePath ? [modulePath] : []),
      {
        persistent: true,
        ignorePermissionErrors: true,
        useFsEvents: true,
        ignoreInitial: true,
        usePolling: false,
        interval: 100,
        binaryInterval: 300
      }
    )
    // watcher.on("change", path => {
    //   if (path === configPath) {
    //     process.stdout.write(this.signal.SERVER_RESTART)
    //   }
    // })
    return watcher
  }
}
