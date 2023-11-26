import { AlbumDevContext, StartCacheUserConfig } from "../../context.type.js"
import { buildStartConfig } from "../../start/buildStartConfig.js"

export function createCacheUserConfig(context: AlbumDevContext): StartCacheUserConfig {
  const { info, clientConfig, serverConfig, userConfig } = context
  const { env, ssr, ssrCompose } = info
  const { basename } = clientConfig.router
  const { port } = serverConfig
  const { logger } = userConfig
  const config: StartCacheUserConfig = {
    info: { env, ssr, ssrCompose },
    clientConfig: { router: basename },
    serverConfig: { port },
    start: buildStartConfig(context),
    logger
  }
  return config
}
