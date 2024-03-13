import { Func } from "@albumjs/tools/node"
import { UserConfig } from "vite"
import { EnvValue } from "../env/env.type.js"
import { LoggerParams } from "../logger/logger.type.js"
import { AlbumUserPlugin } from "../plugins/plugin.dev.type.js"

export type UserConfigEnvValue = Partial<EnvValue>
export type UserConfigEnv = UserConfigEnvValue | string

export interface UserConfigAppRouter {
  basename?: string
  redirect?: Record<string, string>
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
  startRoot?: string
  rewrites?: { encode: Func<[string], string>; decode: Func<[string], string> }[]
}

export interface UserConfigServer {
  port?: number
  appModule?: string
  tsconfig?: string | Record<string, any>
}

export interface AlbumUserConfig {
  root?: string
  env?: UserConfigEnv[]
  app?: UserConfigApp | UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: LoggerParams
  plugins?: AlbumUserPlugin[]
  vite?: UserConfig
}
