import { UserConfig } from "vite"
import { ILogger, LoggerParams } from "../../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../plugins/plugin.type.js"

export interface UserConfigEnv {
  common?: (Record<string, string> | string)[]
  production?: (Record<string, string> | string)[]
  development?: (Record<string, string> | string)[]
}

export interface UserConfigAppRouter {
  basename?: string
}

export interface UserConfigAppModule {
  path?: string
  name?: string
}

export interface UserConfigApp {
  id?: string
  main?: string
  mainSSR?: string
  module?: UserConfigAppModule
  router?: UserConfigAppRouter
}

export interface UserSSRCompose {
  dependencies?: (string | Record<string, Record<string, {}>>)[]
}

export interface UserConfigServer {
  port?: number
}

export interface UserStart {
  root?: string
  ssr?: {
    compose?: boolean
  }
}

export interface UserCustomLogger {
  type: "custom"
  logger: ILogger
}
export interface AlbumUserConfig {
  env?: UserConfigEnv[]
  app?: UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: UserCustomLogger | LoggerParams
  plugins?: AlbumUserPlugin[]
  vite?: UserConfig
  start?: UserStart
}
