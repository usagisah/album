import { stringify } from "@ungap/structured-clone/json"
import { SSRComposeDependencies } from "../../../ssrCompose/ssrCompose.type.js"
import { AlbumDevContext, StartCacheUserConfig } from "../../context.type.js"
import { buildStartConfig } from "../../start/buildStartConfig.js"

export function createCacheUserConfig(context: AlbumDevContext, ssrComposeDependencies?: SSRComposeDependencies): StartCacheUserConfig {
  const { info, clientConfig, serverConfig, userConfig } = context
  const { env, ssr, ssrCompose } = info
  const { basename } = clientConfig.router
  const { port } = serverConfig
  const { logger } = userConfig
  const config: StartCacheUserConfig = {
    info: { env, ssr, ssrCompose },
    clientConfig: { router: basename },
    serverConfig: { port },
    ssrCompose: {
      dependencies: ssrComposeDependencies && stringify(ssrComposeDependencies)
    },
    start: buildStartConfig(context),
    logger
  }
  return config
}
