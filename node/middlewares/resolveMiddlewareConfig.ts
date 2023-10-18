import {
  AlbumContext,
  PluginServerConfigParam
} from "../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../utils/utils.js"
import { viteCoreConfigs } from "./vite/viteCoreConfigs.js"
import { viteOptimizeOptions } from "./vite/viteOptimizeOptions.js"
import { expressOptimizeConfigs } from "./express/expressOptimizeConfigs.js"
import { mergeMultipleViteConfig } from "./mergeMultipleViteConfig.js"

export async function resolveMiddlewareConfig(
  context: AlbumContext,
  forceClient = false
) {
  const { plugins, mode, status, logger } = context
  const { midConfigs, viteConfigs } =
    await callPluginWithCatch<PluginServerConfigParam>(
      plugins.hooks.serverConfig,
      {
        context: new Map(),
        api: plugins.event,
        mode,
        status,
        midConfigs: expressOptimizeConfigs(context),
        viteConfigs: [
          viteCoreConfigs(context, forceClient),
          viteOptimizeOptions(context, forceClient),
        ]
      },
      e => logger.error("PluginServerConfig", e, "album")
    )
  return {
    midConfigs,
    viteConfigs: mergeMultipleViteConfig(viteConfigs)
  }
}
