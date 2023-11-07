import { AlbumDevContext, StartCacheUserConfig } from "../../context.type.js"

export function createCacheUserConfig(context: AlbumDevContext): StartCacheUserConfig {
  const { info, clientConfig, serverConfig, userConfig } = context
  const { env, ssr, ssrCompose } = info
  const { basename } = clientConfig.router
  const { port } = serverConfig
  const { logger } = userConfig
  return {
    info: { env, ssr, ssrCompose },
    clientConfig: { router: basename },
    serverConfig: { port },
    logger
  }
}
