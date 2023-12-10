import { Request } from "express"
import { UserConfig } from "vite"
import { LoggerParams } from "../../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../../plugins/plugin.type.js"
import { Func, Obj } from "../../utils/types/types.js"
import { ClientConfigSSRRender } from "../client/clientConfig.type.js"
import { Env, EnvValue } from "../env/env.type.js"

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
  sendMode?: ClientConfigSSRRender["sendMode"]
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
}

export interface UserConfigServer {
  port?: number
  rewrite?: (Record<string, string> | Func<[string, Record<string, string>, Request]>)[]
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

export interface CacheSSRCompose {
  dependencies?: Map<string, { filename: string; cjs: boolean }>
}

export interface StartCacheUserConfig {
  info: {
    env: Env
    ssr: boolean
    ssrCompose: boolean
  }
  clientConfig: {
    ssrRender: ClientConfigSSRRender
  }
  serverConfig: {
    port: number
    rewrite: string[]
    appModule: {
      input: string | null
    }
  }
  logger?: LoggerParams
}
