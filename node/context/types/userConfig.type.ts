import type { UserConfig as ViteConfig } from "vite"
import type { UserPlugins } from "./plugins.type.js"
import type { ILogger } from "../../modules/logger/logger.type.js"

export interface CustomConfigEnv {}
export type UserConfigEnv = {
  common?: (Record<string, string> | string)[]
  production?: (Record<string, string> | string)[]
  development?: (Record<string, string> | string)[]
}

export interface CustomUserConfigAppRouter {}
export type UserConfigAppRouter = {
  basename?: string
} & CustomUserConfigAppRouter

export interface CustomConfigApp {}
export type UserConfigApp = {
  id?: any
  env?: UserConfigEnv
  main?: string
  mainSSR?: string
  module?: string
  router?: UserConfigAppRouter
} & CustomConfigApp

export interface CustomUserSSRCompose {}
export type UserSSRCompose = {
  root?: string
} & CustomUserSSRCompose

export interface CustomConfigServer {}
export type UserConfigServer = {
  port?: number
} & CustomConfigServer

export interface CustomConfig {}
export type UserConfig = {
  env?: UserConfigEnv[]
  app?: UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: ILogger
  plugins?: UserPlugins[]
  vite?: ViteConfig
} & CustomConfig
