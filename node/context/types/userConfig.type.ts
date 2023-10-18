import { UserConfig as ViteConfig } from "vite"
import { UserPlugins } from "./plugins.type.js"
import { ILogger } from "../../modules/logger/logger.type.js"

export interface CustomConfigEnv {}
export type UserConfigEnv = {
  common?: (Record<string, string> | string)[]
  production?: (Record<string, string> | string)[]
  development?: (Record<string, string> | string)[]
}

export interface CustomConfigApp {}
export type UserConfigApp = {
  id?: any
  env?: UserConfigEnv
  main?: string
  mainSSR?: string
  module?: string
} & CustomConfigApp

export interface CustomConfigServer {}
export type UserConfigServer = {
  port?: number
} & CustomConfigServer

export interface CustomConfig {}
export type UserConfig = {
  env?: UserConfigEnv[]
  app?: UserConfigApp[]
  server?: UserConfigServer
  logger?: ILogger
  plugins?: UserPlugins[]
  vite?: ViteConfig
} & CustomConfig
