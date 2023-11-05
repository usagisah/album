import { INestApplication } from "@nestjs/common"
import EventEmitter from "events"
import { ServerMode } from "../../cli/cli.type.js"
import { SpecialModule } from "../../client/client.type.js"
import { MiddlewareConfigs, PluginViteConfig } from "../../middlewares/middlewares.type.js"
import { DirStruct } from "../../utils/fs/fileManager.js"
import { AlbumDevContext, AlbumStaticInfo, ClientConfig, ClientConfigModule, ClientConfigRouter, Mode } from "../context.type.js"
import { Env } from "../env/env.type.js"
import { DevInputs } from "../inputs/inputs.type.js"
import { SSRCompose } from "../ssrCompose/ssrCompose.type.js"
import { AlbumUserConfig, UserConfigApp } from "../userConfig/userConfig.type.js"

export type PluginGlobalOptions = {
  messages: Map<string, any>
  events: EventEmitter
}

// 修改引用配置文件
export type PluginConfigParams = {
  mode: Mode
  serverMode: ServerMode
  config: AlbumUserConfig
} & PluginGlobalOptions
export type PluginConfig = (param: PluginConfigParams) => any

// 查找入口文件
export type PluginFindEntriesParam = {
  inputs: DevInputs
  app: INestApplication
  result: {
    main: string
    mainSSR: string
    module: ClientConfigModule
    appConfig: UserConfigApp
    router: ClientConfigRouter
  }
} & PluginGlobalOptions
export type PluginFindEntries = (param: PluginFindEntriesParam) => any

// 修改或读取全局唯一内部上下文
export type PluginContextParam = {
  albumContext: AlbumDevContext
} & PluginGlobalOptions
export type PluginContext = (param: PluginContextParam) => any

// 用于生成客户端文件
export type PluginInitClientParam = {
  app: string
  serverMode: ServerMode
  env: Env
  info: AlbumStaticInfo
  clientConfig: ClientConfig
  inputs: DevInputs
  fileManager: DirStruct
  specialModules: SpecialModule[]
  ssrCompose: SSRCompose | null
  result: {
    realClientInput: string
    realSSRInput: string
  }
} & PluginGlobalOptions
export type PluginInitClient = (param: PluginInitClientParam) => any

// 模块发生改变，热更新客户端文件
export type PluginPatchClientParam = {
  app: string
  serverMode: ServerMode
  env: Env
  info: AlbumStaticInfo
  clientConfig: ClientConfig
  inputs: DevInputs
  fileManager: DirStruct
  specialModules: SpecialModule[]
  ssrCompose: SSRCompose | null
} & PluginGlobalOptions
export type PluginPatchClient = (param: PluginPatchClientParam) => any

// 这里能拿到内部存在的，中间件、vite 配置、模块，这些内容的 参数、执行函数 进行自定义修改
export type PluginServerConfigParam = {
  mode: Mode
  env: Env
  info: AlbumStaticInfo
  midConfigs: MiddlewareConfigs
  viteConfigs: PluginViteConfig[]
} & PluginGlobalOptions
export type PluginServerConfig = (param: PluginServerConfigParam) => any

// 可以拿到 app，进行服务器设置
// 和 PluginServerConfig 的区别在于，有些模式会跳过这个，例如build，因为打包时不需要起服务
export type PluginServerParam = {
  mode: Mode
  env: Env
  info: AlbumStaticInfo
  app: INestApplication
} & PluginGlobalOptions
export type PluginServer = (param: PluginServerParam) => any

export type PluginBuildEndParam = {} & PluginGlobalOptions
export type PluginBuildEnd = (param: PluginBuildEndParam) => any

export type AlbumUserPlugin = {
  name: string
  config?: PluginConfig
  findEntries?: PluginFindEntries
  context?: PluginContext
  initClient?: PluginInitClient
  patchClient?: PluginPatchClient
  serverConfig?: PluginServerConfig
  server?: PluginServer
  buildEnd?: PluginBuildEnd
}