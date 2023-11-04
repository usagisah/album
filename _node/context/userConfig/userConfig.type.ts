import { UserConfig } from "vite"
import { AlbumUserPlugins } from "../plugins/plugin.type.js"

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
  id?: any
  env?: UserConfigEnv
  main?: string
  mainSSR?: string
  module?: UserConfigAppModule
  router?: UserConfigAppModule
}

export interface UserSSRCompose {
  dependencies?: (
    | string
    | {
        [moduleName: string]: {
          [subModuleName: string]: {}
        }
      }
  )[]
}

export interface UserConfigServer {
  port?: number
}

export interface UserStart {
  root?: string
  ssr?: {}
}

export interface CustomConfig {}
export interface AlbumUserConfig {
  env?: UserConfigEnv[]
  app?: UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: ILogger
  plugins?: AlbumUserPlugins[]
  vite?: UserConfig
  start?: UserStart
}
