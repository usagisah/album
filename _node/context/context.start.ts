import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { createSSRComposeConfig } from "../ssrCompose/dev/createSSRComposeConfig.js"
import { waitPromiseAll } from "../utils/promises/waitPromiseAll.js"
import { createClientConfig } from "./client/clientConfig.js"
import { AlbumDevContext, CreateContextParams } from "./context.type.js"
import { registryEnv } from "./env/dev/env.dev.js"
import { createFileManager } from "./fileManager/fileManager.js"
import { buildDevInputs } from "./inputs/dev/buildInputs.dev.js"
import { buildOutputs } from "./outputs/dev/buildOutputs.js"
import { callPluginWithCatch } from "./plugins/callPluginWithCatch.js"
import { normalizePlugins } from "./plugins/plugins.js"
import { createServerConfig } from "./server/serverConfig.js"
import { loadConfig } from "./userConfig/dev/loadConfig.dev.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"
import { createWatcher } from "./watcher/watcher.js"

export async function createAlbumDevContext(params: CreateContextParams): Promise<AlbumDevContext> {
  let logger: ILogger = console
  try {
    const { appId, mode, serverMode, args } = params
    const inputs = buildDevInputs()
    const userConfig = (await loadConfig({ mode, args, inputs })) ?? ({} as AlbumUserConfig)
    logger = resolveLogger(userConfig.logger)

    const pluginConfig = normalizePlugins(userConfig.plugins)
    const { events, plugins } = pluginConfig
    await callPluginWithCatch("config", plugins, { events, messages: new Map(), mode, serverMode, config: userConfig }, logger)

    const [{ appFileManager, dumpFileManager }, env, clientConfig, serverConfig] = await waitPromiseAll([
      createFileManager(inputs),
      registryEnv(serverMode, inputs, userConfig.env),
      createClientConfig({
        appId,
        inputs,
        logger,
        pluginConfig,
        conf: userConfig.app
      }),
      createServerConfig(userConfig.server)
    ])
    const ssrComposeConfig = await createSSRComposeConfig()
    const outputs = buildOutputs()
    const watcher = createWatcher(inputs, clientConfig)
    return {
      info: {
        mode,
        serverMode,
        ssr: !!clientConfig.mainSSRInput,
        inputs,
        outputs,
        env
      },
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
      ssrComposeManager: null
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
