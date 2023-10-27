import type { ViteUserConfig } from "../../middlewares/middlewares.type.js"
import type { ILogger } from "../../modules/logger/logger.type.js"
import type { UserPlugins } from "./plugins.type.js"

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

export interface CustomUserConfigAppRouter {}
export type UserConfigAppModule = {
  path?: string
  name?: string
} & CustomUserConfigAppRouter

export interface CustomConfigApp {}
export type UserConfigApp = {
  id?: any
  env?: UserConfigEnv
  main?: string
  mainSSR?: string
  module?: UserConfigAppModule
  router?: UserConfigAppModule
} & CustomConfigApp

export interface CustomUserSSRCompose {}
export type UserSSRCompose = {} & CustomUserSSRCompose

export interface CustomConfigServer {}
export type UserConfigServer = {
  port?: number
} & CustomConfigServer

export type UserStartSSR = {}

export interface CustomUserStart {}
export type UserStart = {
  root?: string
  ssr?: UserStartSSR
} & CustomUserStart

export interface CustomConfig {}
export type UserConfig = {
  env?: UserConfigEnv[]
  app?: UserConfigApp[]
  ssrCompose?: UserSSRCompose
  server?: UserConfigServer
  logger?: ILogger
  plugins?: UserPlugins[]
  vite?: ViteUserConfig
  start?: UserStart
} & CustomConfig
