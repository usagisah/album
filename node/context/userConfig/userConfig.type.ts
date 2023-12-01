import { UserConfig } from "vite"
import { LoggerParams } from "../../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../../plugins/plugin.type.js"
import { Env, EnvValue } from "../env/env.type.js"
import { UserDevStartConfig } from "../start/start.type.js"

export type UserConfigEnvValue = Partial<EnvValue>
export type UserConfigEnv = UserConfigEnvValue | string

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
  dependencies?: string[]
}

export interface UserConfigServer {
  port?: number
}

export interface AlbumUserConfig {
  env?: UserConfigEnv[]
  app?: UserConfigApp | UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: LoggerParams
  plugins?: AlbumUserPlugin[]
  vite?: UserConfig
  start?: UserDevStartConfig
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
    router: string
  }
  serverConfig: {
    port: number
  }
  start: {
    root: string
  }
  logger?: LoggerParams
}
