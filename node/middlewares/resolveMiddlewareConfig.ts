import { AlbumDevContext } from "../context/context.type.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { expressConfigs } from "./express/expressConfigs.js"
import { mergeMultipleViteConfig } from "./vite/mergeMultipleViteConfig.js"
import { viteCoreOptions } from "./vite/viteCoreConfig.js"
import { viteOptimizeOptions } from "./vite/viteOptimizeConfig.js"

export async function resolveMiddlewareConfig(context: AlbumDevContext, forceClient = false) {
  const { info, pluginConfig, userConfig, logger } = context
  const { plugins, events } = pluginConfig
  const { midConfigs, viteConfigs } = await callPluginWithCatch(
    "serverConfig",
    plugins,
    {
      messages: new Map(),
      events,
      info,
      midConfigs: expressConfigs(context),
      viteConfigs: [
        viteCoreOptions(context, forceClient),
        viteOptimizeOptions(context, forceClient),
        ...(userConfig.vite
          ? [
              {
                name: "userViteConfig",
                config: userConfig.vite
              }
            ]
          : [])
      ]
    },
    logger
  )
  debugger
  return { midConfigs, viteConfigs: mergeMultipleViteConfig(viteConfigs) }
}
