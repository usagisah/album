import type { EnvValue } from "./env.type.js"

export type ClientConfig = {
  main: string
  mainSSR?: string
  module?: {
    moduleName: string
    modulePath: string
  }
  env: EnvValue
  router: { basename: string }
  tsconfig?: string
  [x: string]: any
}