import type { FSWatcher } from "chokidar"
import { ViteDevServer, UserConfig as ViteUserConfig } from "vite"
import type { AlBumServerMode } from "../cli/cli.type.js"
import type { ILogger } from "../modules/logger/logger.type.js"
import type { AppConfigs, AppInputs, AppManager, AppMode, AppOutputs, AppStatus, ClientConfig, EnvValue, PluginFindEntriesParam, Plugins, ServerConfig, SsrComposeProjectsInput, UserConfig, UserSSRCompose } from "./AlbumContext.type.js"

import chokidar from "chokidar"
import { build as esbuild } from "esbuild"
import { EventEmitter } from "events"
import { existsSync, readdirSync, rmSync, statSync } from "fs"
import { resolve } from "path"
import { SERVER_EXIT, SERVER_RESTART } from "../constants/constants.js"
import { Logger } from "../modules/logger/logger.js"
import { DirStruct, PromiseAll, callPluginWithCatch, findEndEntryPath, isArray, isFunction, isNumber, isPlainObject, isString } from "../utils/utils.js"
import { createEmptyEnvValue, transformEnvValue } from "./env/env.js"
import { StartConfig } from "./types/startConfig.type.js"

export class AlbumContext {
  constructor(
    public app: string,
    public serverMode: AlBumServerMode,
    public mode: AppMode
  ) {}

  inputs: AppInputs = {
    // 根目录
    cwd: null,
    dumpInput: null,
    startInput: null,

    // 开发
    clientInput: null,
    ssrInput: null,
    realClientInput: null,
    realSSRInput: null,
    realSSRComposeInput: null,

    // ssr-compose
    ssrComposeModuleRootInput: null,
    ssrComposeProjectsInput: null
  }
  outputs: AppOutputs = {
    clientOutDir: null,
    ssrOutDir: null
  }
  configs: AppConfigs = {
    userConfig: null,
    clientConfig: null,
    serverConfig: null,
    ssrCompose: null,
    startConfig: null
  }
  manager: AppManager = {
    clientManager: null,
    fileManager: null,
    serverManager: null
  }
  status: AppStatus = { ssr: false, env: {} }
  signal = { SERVER_EXIT, SERVER_RESTART }
  logger: ILogger
  watcher: FSWatcher
  plugins: { hooks: Plugins; event: EventEmitter }
  vite: { viteConfig: ViteUserConfig; viteDevServer: ViteDevServer | null } = { viteConfig: null, viteDevServer: null }
  errors: any[] = []

  async normalize(): Promise<[any[], AlbumContext]> {
    try {
      this.mountBasicInputs()

      const logger = (this.logger = new Logger())
      const _userConfig = await this.loadConfig()

      this.plugins = {
        hooks: await this.normalizePlugins(_userConfig.plugins),
        event: this.createPluginEvents()
      }

      const userConfig = await callPluginWithCatch<UserConfig>(this.plugins.hooks.config, _userConfig, e => logger.error("PluginConfig", e, "album"))
      this.configs.userConfig = userConfig
      this.vite.viteConfig = userConfig.vite ?? {}
      if (this.serverMode !== "start") {
        this.manager.fileManager = new DirStruct({
          name: ".album",
          path: this.inputs.dumpInput
        })
      }

      await this.normalizeStartConfig(userConfig.start)
      const [envConfig] = await PromiseAll([transformEnvValue(userConfig.env), this.normalizeClientConfig(userConfig.app), this.normalizeServerConfig(userConfig.server)])
      await this.normalizeSSRCompose(userConfig.ssrCompose)

      this.status.env = this.registryEnv(envConfig, this.configs.clientConfig.env)
      this.mountOutputs()
      this.tryWatcher()

      return [this.errors, this]
    } catch (e) {
      this.errors.unshift(e)
      throw new Error(this.errors as any, { cause: "albumContext" })
    }
  }

  mountBasicInputs() {
    const cwd = process.cwd()
    this.inputs.cwd = cwd

    if (this.serverMode !== "start") {
      this.inputs.dumpInput = resolve(cwd, ".album")
    }
  }

  mountBasicServeInput() {
    if (this.serverMode !== "start") {
      const { main, mainSSR } = this.configs.clientConfig
      this.inputs.clientInput = main
      this.inputs.ssrInput = mainSSR
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

  async normalizeStartConfig(userStartConfig: any): Promise<StartConfig> {
    if (this.serverMode !== "start") {
      return
    }

    if (userStartConfig && !isPlainObject(userStartConfig)) {
      throw "配置错误 config.start 配置必须是一个对象"
    }

    const { root } = userStartConfig
    const { cwd } = this.inputs
    if (root) {
      if (!isString(root)) {
        throw "配置错误 config.start.root 配置必须是一个字符串"
      }

      const startInput = resolve(cwd, root)
      try {
        const fileInfo = statSync(startInput)
        if (!fileInfo.isDirectory()) {
          throw "配置错误 config.start.root 配置路径必须是一个文件夹"
        }
      } catch {
        throw "配置错误 config.start.root 配置路径不存在"
      }
      this.inputs.startInput = startInput
      this.inputs.ssrComposeModuleRootInput = startInput
    } else {
      const targetDir = (this.configs.ssrCompose || this.app !== "default") ? "dist" : this.app
      const distPath = resolve(cwd, targetDir)
      const startInput = existsSync(distPath) ? distPath : cwd
      this.inputs.startInput = startInput
      this.inputs.ssrComposeModuleRootInput = startInput
    }
  }

  async normalizeClientConfig(clientConfig: any) {
    if (this.serverMode === "start") {
      if (this.configs.userConfig.ssrCompose) {
        return
      }

      const realSSRInput = await findEndEntryPath({
        cwd: this.inputs.startInput,
        presets: ["server", "", "ssr"],
        suffixes: ["main.ssr"]
      })
      if (!realSSRInput) {
        throw "找不到 ssr 启动入口文件，请确保入口文件名称是以(.main.ssr|main.ssr)结尾，并放在(server|config.start.root|ssr)目录下"
      }
      this.inputs.realSSRInput = realSSRInput
      return
    }

    if (!clientConfig) clientConfig = [{}]
    if (!Array.isArray(clientConfig)) {
      throw "配置错误 config.app 配置必须是一个数组"
    }

    let ids = new Set<string>()
    for (const item of clientConfig) {
      if (!isPlainObject(item)) {
        throw "配置错误 config.app 配置每一项都必须是对象"
      }
      ids.add(item.id + "")
    }
    if (ids.size !== clientConfig.length) {
      throw "配置错误 config.app 每项必须携带唯一 id, 用于启动参数匹配"
    }

    const conf = clientConfig.length === 1 ? clientConfig[0] : clientConfig.find(v => v.id === this.app)
    if (!conf) {
      throw "配置错误 config.app 中找不到指定的或默认的启动项"
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
        basename: isString(userRouterConfig.basename) ? userRouterConfig.basename : ""
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
      if (!_clientConfig.module.moduleName || !isString(_clientConfig.module.moduleName) || !_clientConfig.module.modulePath || !isString(_clientConfig.module.modulePath)) {
        throw "配置错误 config.app.module[name | path] 必须是字符串"
      }
    }
    if (_clientConfig.mainSSR) {
      this.status.ssr = true
    }

    _clientConfig.env = conf.env ? await transformEnvValue(conf.env) : createEmptyEnvValue()
    this.configs.clientConfig = _clientConfig
  }

  async normalizeServerConfig(serverConfig: any) {
    if (!serverConfig) serverConfig = {}

    const _serverConfig: ServerConfig = {
      port: 5173
    }

    if (serverConfig.port) {
      if (!isNumber(_serverConfig.port)) {
        throw "配置错误 config.port 入口选项(port)不是合法值，需要一个数字"
      }
      _serverConfig.port = serverConfig.port
    }

    this.configs.serverConfig = _serverConfig
  }

  async normalizeSSRCompose(ssrCompose: UserSSRCompose) {
    if (this.serverMode === "start") {
      const { ssrComposeModuleRootInput } = this.inputs
      const projectInputs: SsrComposeProjectsInput = (this.inputs.ssrComposeProjectsInput = new Map())
      for (const fileInfo of readdirSync(ssrComposeModuleRootInput, { withFileTypes: true })) {
        const { name } = fileInfo
        if (!fileInfo.isDirectory()) continue

        const clientPath = resolve(ssrComposeModuleRootInput, name, "client")
        const clientManifestInput = resolve(ssrComposeModuleRootInput, name, "client/manifest.json")
        const serverPath = resolve(ssrComposeModuleRootInput, name, "server")
        if (!existsSync(clientPath) || !!existsSync(clientManifestInput) || !existsSync(serverPath)) continue

        const serverInput = await findEndEntryPath({
          cwd: ssrComposeModuleRootInput,
          presets: ["./"],
          suffixes: ["main.ssr"]
        })
        if (!serverInput) continue

        projectInputs.set(name, { clientManifestInput, serverInput })
      }
      return
    }

    if (!ssrCompose) return

    if (!isPlainObject(ssrCompose)) {
      throw "配置错误 config.ssrCompose 配置必须是一个对象"
    }
    this.configs.ssrCompose = {}
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

  mountOutputs() {
    const outputs = {
      clientOutDir: "",
      ssrOutDir: ""
    }

    const { cwd } = this.inputs
    const targetDir = this.app === "default" ? "dist" : this.app
    const baseOutDir = resolve(cwd, targetDir)
    if (this.status.ssr) {
      outputs.clientOutDir = resolve(baseOutDir, targetDir, "client")
      outputs.ssrOutDir = resolve(baseOutDir, targetDir, "server")
    } else {
      outputs.clientOutDir = resolve(baseOutDir, targetDir)
    }
    this.outputs = outputs
  }

  tryWatcher() {
    if (!["dev"].includes(this.serverMode)) {
      return
    }

    const modulePath = this.configs.clientConfig.module?.modulePath
    const configPath = resolve(this.inputs.cwd, "album.config.ts")
    const watcher = chokidar.watch([configPath].concat(modulePath ? [modulePath] : []), {
      persistent: true,
      ignorePermissionErrors: true,
      useFsEvents: true,
      ignoreInitial: true,
      usePolling: false,
      interval: 100,
      binaryInterval: 300
    })
    this.watcher = watcher
  }
}
