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
  PluginFindEntriesParam
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
  isPlainObject
} from "../utils/utils.js"
import { createEmptyEnvValue, transformEnvValue } from "./helpers/env.js"

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
        clientManager: {} as any,
        serverManager: {} as any
      }

      const [env, clientConfig, serverConfig] = await PromiseAll([
        transformEnvValue(userConfig.env),
        this.normalizeClientConfig(userConfig.app),
        this.normalizeServerConfig(userConfig.server)
      ])

      this.configs = {
        userConfig,
        clientConfig,
        serverConfig
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

    const _clientConfig: ClientConfig = {
      main: "",
      mainSSR: null,
      module: null,
      env: {}
    }

    const { result } = await callPluginWithCatch<PluginFindEntriesParam>(
      this.plugins.hooks.findEntries,
      {
        context: new Map(),
        api: this.plugins.event,
        result: {
          main: conf.main,
          mainSSR: conf.mainSSR,
          module: conf.module,
          appConfig: conf
        }
      },
      e => this.logger.error("findEntries", e, "album")
    )

    _clientConfig.main = result.main + ""
    _clientConfig.mainSSR = result.mainSSR ? result.mainSSR + "" : null
    _clientConfig.module = result.module
      ? {
          modulePath: result.module + "",
          moduleName: basename(result.module + "")
        }
      : null

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
    }

    if (_clientConfig.mainSSR) {
      this.status.ssr = true
    }

    _clientConfig.env = conf.env
      ? transformEnvValue(conf.env)
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

  buildOutputs() {
    const { dumpInput } = this.inputs
    const outputs: AppOutputs = {
      clientOutDir: "",
      ssrOutDir: ""
    }
    if (this.status.ssr) {
      outputs.clientOutDir = resolve(dumpInput, "dist_client")
      outputs.ssrOutDir = resolve(dumpInput, "dist_server")
    } else {
      outputs.clientOutDir = resolve("dist")
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
