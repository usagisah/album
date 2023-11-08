import EventEmitter from "events"
import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { createSSRComposeConfig } from "../ssrCompose/dev/createSSRComposeConfig.dev.js"
import { isPlainObject } from "../utils/check/simple.js"
import { waitPromiseAll } from "../utils/promises/waitPromiseAll.js"
import { createClientConfig } from "./client/clientConfig.js"
import { AlbumDevContext, CreateContextParams, PluginConfig } from "./context.type.js"
import { registryEnv } from "./env/dev/env.dev.js"
import { createFileManager } from "./fileManager/fileManager.js"
import { buildDevInputs } from "./inputs/buildInputs.dev.js"
import { buildOutputs } from "./outputs/buildOutputs.dev.js"
import { createServerConfig } from "./server/serverConfig.js"
import { loadConfig } from "./userConfig/dev/loadConfig.dev.js"
import { createWatcher } from "./watcher/watcher.js"

export async function createAlbumDevContext(params: CreateContextParams): Promise<AlbumDevContext> {
  let logger: ILogger = console
  try {
    const { appId, mode, serverMode, args } = params
    const inputs = buildDevInputs()
    const userConfig = await loadConfig({ mode, args, inputs })
    logger = new Logger(isPlainObject(userConfig.logger) ? userConfig.logger : undefined)

    const pluginConfig: PluginConfig = { events: new EventEmitter(), plugins: userConfig.plugins ?? [] }
    await callPluginWithCatch("config", pluginConfig.plugins, { events: pluginConfig.events, messages: new Map(), mode, serverMode, config: userConfig }, logger)

    const [{ appFileManager, dumpFileManager }, env, clientConfig, serverConfig] = await waitPromiseAll([
      createFileManager(inputs),
      registryEnv(serverMode, inputs, userConfig.env),
      createClientConfig({
        appId,
        inputs,
        logger,
        pluginConfig,
        conf: userConfig.app,
        ssrCompose: !!userConfig.ssrCompose
      }),
      createServerConfig(userConfig.server)
    ])
    const ssrComposeConfig = await createSSRComposeConfig({ appId, clientConfig, ssrCompose: userConfig.ssrCompose })
    const ssr = !!clientConfig.mainSSRInput
    return {
      info: { appId, mode, serverMode, ssr, ssrCompose: !!ssrComposeConfig, inputs, outputs: buildOutputs(appId, ssr, inputs), env },
      logger,
      watcher: createWatcher(inputs, clientConfig),

      appFileManager,
      dumpFileManager,

      pluginConfig,
      clientConfig,
      serverConfig,
      ssrComposeConfig,
      userConfig,

      clientManager: null,
      viteDevServer: null
    }
  } catch (e) {
    logger.error(e, "album")
    throw e
  }
}
