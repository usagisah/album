import { LoggerParams } from "../../modules/logger/logger.type.js"
import { ClientConfigSSRRender } from "../client/clientConfig.type.js"
import { Env } from "../env/env.type.js"

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
