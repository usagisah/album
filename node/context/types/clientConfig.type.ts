export type ClientConfig = {
  main: string
  mainSSR?: string
  module?: {
    moduleName: string
    modulePath: string
  }
  tsconfig?: string
  [x: string]: any
}