import type { EnvValue } from "./env.type.js"

export type ClientConfigModule = {
  moduleName: string
  modulePath: string
}

export type ClientConfigRouter = {
  basename: string
}

export type ClientConfig = {
  main: string
  mainSSR: string | null
  module: ClientConfigModule
  env: EnvValue
  router: ClientConfigRouter
  [x: string]: any
}