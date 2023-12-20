import { UserConfig } from "vite"
import { EnvValue } from "../env/env.type.js"
import { LoggerParams } from "../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../plugins/plugin.dev.type.js"
import { Func, Obj } from "../utils/types/types.js"

export type UserConfigEnvValue = Partial<EnvValue>
export type UserConfigEnv = UserConfigEnvValue | string

export interface UserConfigAppRouter {
  basename?: string
}

export interface UserConfigAppModule {
  path?: string
  name?: string
  ignore?: (string | RegExp)[]
}

export interface UserConfigAppSSRRender {
  sendMode?: "pipe" | "string"
}

export interface UserConfigApp {
  id?: string
  main?: string
  mainSSR?: string
  ssrRender?: UserConfigAppSSRRender
  module?: UserConfigAppModule
  router?: UserConfigAppRouter
}

export interface UserSSRCompose {
  dependencies?: string[]
  castExtensions?: string[]
  refPaths?: string[]
  rewrites?: (Record<string, string> | Func<[string, Record<string, string>], string>)[]
}

export interface UserConfigServer {
  port?: number
  appModule?: string
  tsconfig?: string | Obj
}

export interface AlbumUserConfig {
  env?: UserConfigEnv[]
  app?: UserConfigApp | UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: LoggerParams
  plugins?: AlbumUserPlugin[]
  vite?: UserConfig
}
