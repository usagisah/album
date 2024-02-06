import { Env } from "env/env.type.js"
import { AppManager, AppManagerSSRRender } from "../app/app.start.type.js"
import { ILogger, LoggerParams } from "../logger/logger.type.js"
import { ServerManager } from "../server/server.start.type.js"
import { SSRComposeManager } from "../ssrCompose/ssrCompose.start.type.js"

export type Inputs = {
  cwd: string
  root: string
  clientInput: string
  ssrInput: string
  mainSSRInput: string
  apiAppInput: string
}

export interface CacheConfig {
  ssr: boolean
  ssrCompose: boolean
  env: Env
  appConfig: {
    ssrRender: AppManagerSSRRender
  }
  serverConfig: {
    port: number
    appModule: { input: string }
  }
  ssrComposeConfig: {
    rewrites: string[]
  }
  logger: LoggerParams | null
}

export type AlbumContext = {
  serverMode: "start"
  ssr: boolean
  ssrCompose: boolean
  inputs: Inputs
  env: Env
  logger: ILogger

  appManager: AppManager
  serverManager: ServerManager
  ssrComposeManager: SSRComposeManager
  cacheConfig: CacheConfig
}

// export interface CacheSSRCompose {
//   dependencies?: Map<string, { filename: string; cjs: boolean }>
// }
