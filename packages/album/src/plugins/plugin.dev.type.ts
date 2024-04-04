import { FileManager, NodeArgs } from "@albumjs/tools/node"
import { INestApplication } from "@nestjs/common"
import EventEmitter from "events"
import { InlineConfig } from "vite"
import { AppManagerModule, AppManagerRouter, AppManagerSSRRender, AppSpecialModule } from "../app/app.dev.type.js"
import { AlbumContext, ContextStaticInfo, Inputs } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { AlbumServerExpressConfig, AlbumServerViteConfig } from "../middlewares/middlewares.type.js"
import { ServerMode } from "../service/service.type.js"
import { AlbumUserConfig, UserConfigApp, UserConfigAppModule, UserConfigAppRouter } from "../user/user.dev.type.js"
import { createPluginManager } from "./pluginManager.dev.js"

export type PluginGlobalMessage = {
  messages: Map<string, any>
  events: EventEmitter
}

export type PluginManager = ReturnType<typeof createPluginManager>

// 修改引用配置文件
export type PluginConfigParams = {
  serverMode: ServerMode
  args: NodeArgs
  config: AlbumUserConfig
} & PluginGlobalMessage
export type PluginConfig = (param: PluginConfigParams) => any

// 查找入口文件
export type PluginFindEntriesParam = {
  logger: ILogger
  inputs: Inputs
  appId: string
  main?: string
  mainSSR?: string
  modules?: UserConfigAppModule[]
  router?: UserConfigAppRouter
  appConfig: UserConfigApp
} & PluginGlobalMessage
export type PluginFindEntries = (param: PluginFindEntriesParam) => any

// 修改或读取全局唯一内部上下文
export type PluginContextParam = {
  albumContext: AlbumContext
} & PluginGlobalMessage
export type PluginContext = (param: PluginContextParam) => any

// 用于生成客户端文件
export type PluginInitClientParam = {
  logger: ILogger
  info: ContextStaticInfo
  appManager: {
    mainInput: string
    mainSSRInput: string | null
    ssrRender: AppManagerSSRRender
    modules: AppManagerModule[]
    router: AppManagerRouter
    specialModules: AppSpecialModule[][]
  }
  appFileManager: FileManager
  dumpFileManager: FileManager
  realClientInput: string | null
  realSSRInput: string | null
} & PluginGlobalMessage
export type PluginInitClient = (param: PluginInitClientParam) => any

// 模块发生改变，热更新客户端文件
export type PluginPatchClientParam = {
  logger: ILogger
  info: ContextStaticInfo
  updateInfo: { type: "add" | "unlink" | "unlinkDir"; path: string }
  appManager: {
    mainInput: string
    mainSSRInput: string | null
    ssrRender: AppManagerSSRRender
    modules: AppManagerModule[]
    router: AppManagerRouter
    specialModules: AppSpecialModule[][]
  }
  appFileManager: FileManager
  dumpFileManager: FileManager
} & PluginGlobalMessage
export type PluginPatchClient = (param: PluginPatchClientParam) => any

// 这里能拿到内部存在的，中间件、vite 配置、模块，这些内容的 参数、执行函数 进行自定义修改
export type PluginServerConfigParam = {
  logger: ILogger
  info: ContextStaticInfo
  midConfigs: AlbumServerExpressConfig[]
  viteConfigs: AlbumServerViteConfig[]
} & PluginGlobalMessage
export type PluginServerConfig = (param: PluginServerConfigParam) => any

// 可以拿到 app，进行服务器设置
// 和 PluginServerConfig 的区别在于，有些模式会跳过这个，例如build，因为打包时不需要起服务
export type PluginServerParam = {
  logger: ILogger
  info: ContextStaticInfo
  app: INestApplication
} & PluginGlobalMessage
export type PluginServer = (param: PluginServerParam) => any

// 打包开始
// 用于自定义打包逻辑，可手动结束
export type PluginBuildStartParam = {
  logger: ILogger
  info: ContextStaticInfo
  resolveMiddlewareConfig: (forceClient?: boolean) => Promise<{
    midConfigs: AlbumServerExpressConfig[]
    viteConfigs: InlineConfig
  }>
  forceQuit: boolean
} & PluginGlobalMessage
export type PluginBuildStart = (param: PluginBuildStartParam) => any

export type PluginBuildEndParam = {
  logger: ILogger
  info: ContextStaticInfo
  resolveMiddlewareConfig: (forceClient?: boolean) => Promise<{
    midConfigs: AlbumServerExpressConfig[]
    viteConfigs: InlineConfig
  }>
} & PluginGlobalMessage
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
  buildStart?: PluginBuildStart
  buildEnd?: PluginBuildEnd
}
