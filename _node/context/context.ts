import { callPluginWithCatch } from "../utils/album/callPluginWithCatch.js"
import { CreateContextParams } from "./context.type.js"
import { buildDevInputs } from "./inputs/mountInputs.dev.js"
import { normalizePlugins } from "./plugins/plugins.js"
import { loadDevConfig } from "./userConfig/loadConfig.dev.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"
import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"

export async function createAlbumDevContext(params: CreateContextParams) {
  let logger: ILogger = console
  try {
    const { mode, serverMode, args } = params
    const inputs = buildDevInputs()
    const userConfig = (await loadDevConfig({ mode, args, inputs })) ?? ({} as AlbumUserConfig)
    logger = resolveLogger(userConfig.logger)

    const { events, plugins } = normalizePlugins(userConfig.plugins)
    await callPluginWithCatch("config", plugins, { events, config: userConfig }, e => logger.error("PluginConfig", e, "album"))



  } catch (e) {
    logger.error(e, "album")
  }
}

function resolveLogger(value: any): ILogger {
  if (!value) return new Logger({})
  if (value.type === "custom") value
  return new Logger(value)
}