import type { INestApplication } from "@nestjs/common"
import type EventEmitter from "events"
import type { AlBumServerMode } from "../../cli/cli.type.js"
import type { SpecialModule } from "../../client/client.type.js"
import type { MiddlewareConfigs, PluginViteConfig } from "../../middlewares/middlewares.type.js"
import type { DirStruct } from "../../utils/utils.js"
import type { AlbumContext } from "../AlbumContext.js"
import type { AppInputs, AppMode, AppStatus, ClientConfig, ClientConfigModule, ClientConfigRouter } from "../AlbumContext.type.js"
import type { SSRCompose } from "./ssr-compose.type.js"
import type { UserConfig, UserConfigApp } from "./userConfig.type.js"

export type PluginParamsContext = {
  api: EventEmitter
  context: Map<string, any>
}

// 修改引用配置文件
export type PluginConfig = (param: UserConfig) => any

// 查找入口文件
export type PluginFindEntriesParam = {
  inputs: AppInputs
  result: {
    main: string
    mainSSR: string
    module: ClientConfigModule
    appConfig: UserConfigApp
    router: ClientConfigRouter
  }
} & PluginParamsContext
export type PluginFindEntries = (param: PluginFindEntriesParam) => any

// 修改或读取全局唯一内部上下文
export type PluginContextParam = {
  albumContext: AlbumContext
} & PluginParamsContext
export type PluginContext = (param: PluginContextParam) => any

// 用于生成客户端文件
export type PluginInitClientParam = {
  app: string
  serverMode: AlBumServerMode
  status: AppStatus
  clientConfig: ClientConfig
  inputs: AppInputs
  fileManager: DirStruct
  specialModules: SpecialModule[]
  ssrCompose: SSRCompose | null
  result: {
    realClientInput: string
    realSSRInput: string
  }
} & PluginParamsContext
export type PluginInitClient = (param: PluginInitClientParam) => any

// 模块发生改变，热更新客户端文件
export type PluginPatchClientParam = {
  app: string
  serverMode: AlBumServerMode
  status: AppStatus
  clientConfig: ClientConfig
  inputs: AppInputs
  fileManager: DirStruct
  specialModules: SpecialModule[]
  ssrCompose: SSRCompose | null
} & PluginParamsContext
export type PluginPatchClient = (param: PluginPatchClientParam) => any

// 这里能拿到内部存在的，中间件、vite 配置、模块，这些内容的 参数、执行函数 进行自定义修改
export type PluginServerConfigParam = {
  mode: AppMode
  status: AppStatus
  midConfigs: MiddlewareConfigs
  viteConfigs: PluginViteConfig[]
} & PluginParamsContext
export type PluginServerConfig = (param: PluginServerConfigParam) => any

// 可以拿到 app，进行服务器设置
// 和 PluginServerConfig 的区别在于，有些模式会跳过这个，例如build，因为打包时不需要起服务
export type PluginServerParam = {
  mode: AppMode
  status: AppStatus
  app: INestApplication
} & PluginParamsContext
export type PluginServer = (param: PluginServerParam) => any

export type PluginBuildEndParam = {} & PluginParamsContext
export type PluginBuildEnd = (param: PluginBuildEndParam) => any

// 阶段性日志，可以混入信息，也可以阻断打印
export type PluginOnLogParam =
  | {
      type: "useConfig"
      albumContext: AlbumContext
      messages: [...(Record<string, any> | string)[], string][]
    }
  | {
      type: "onServerStart"
      albumContext: AlbumContext
      messages: [...(Record<string, any> | string)[], string][]
    }
  | {
      type: "onBuildStart"
      albumContext: AlbumContext
      messages: [...(Record<string, any> | string)[], string][]
    }
  | {
      type: "onBuildEnd"
      albumContext: AlbumContext
      messages: [...(Record<string, any> | string)[], string][]
    }
export type PluginOnLog = (param: PluginOnLogParam) => any

export type UserPlugins = {
  config?: PluginConfig
  findEntries?: PluginFindEntries
  context?: PluginContext
  initClient?: PluginInitClient
  patchClient?: PluginPatchClient
  serverConfig?: PluginServerConfig
  server?: PluginServer
  buildEnd?: PluginBuildEnd
  onStageLog?: PluginOnLog
}

export type Plugins = { [K in keyof UserPlugins]-?: UserPlugins[K][] }
