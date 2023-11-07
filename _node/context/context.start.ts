import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { waitPromiseAll } from "../utils/promises/waitPromiseAll.js"
import { createClientConfig } from "./client/clientConfig.js"
import { AlbumDevContext, AlbumStaticInfo, CreateContextParams } from "./context.type.js"
import { registryEnv } from "./env/start/env.start.js"
import { createFileManager } from "./fileManager/fileManager.js"
import { buildOutputs } from "./outputs/buildOutputs.dev.js"
import { callPluginWithCatch } from "./plugins/callPluginWithCatch.js"
import { createServerConfig } from "./server/serverConfig.js"
import { loadConfig } from "./userConfig/start/loadConfig.start.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"
import { createWatcher } from "./watcher/watcher.js"

export async function createAlbumStartContext(params: CreateContextParams) {
  let logger: ILogger = console
  try {
    const { appId, mode, serverMode, args } = params
    const cwd = process.cwd()
    const cacheConfig = await loadConfig()
    logger = resolveLogger(cacheConfig.logger)

    const env = registryEnv(cacheConfig.info.env)
    const ssrComposeConfig = await createSSRComposeStartConfig({ appId, clientConfig, ssrCompose: userConfig.ssrCompose })
    const info: AlbumStaticInfo = {
      appId,
      mode,
      serverMode,
      ssr: cacheConfig.info.ssr,
      ssrCompose: cacheConfig.info.ssrCompose,
      cwd,
      env
    }
    return {
      info,
      logger,
      watcher,

      appFileManager,
      dumpFileManager,

      pluginConfig,
      clientConfig,
      serverConfig,
      ssrComposeConfig,
      userConfig,

      clientManager: null,
      serverManager: null,
      ssrComposeManager: null,

      viteDevServer: null
    }
  } catch (e) {
    logger.error(e, "album")
    throw e
  }
}

function resolveLogger(value: any): ILogger {
  if (!value) return new Logger({})
  if (value.type === "custom") value
  return new Logger(value)
}
