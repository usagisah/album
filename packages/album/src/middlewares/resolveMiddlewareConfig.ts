import { AlbumContext } from "../context/context.dev.type.js"
import { expressConfigs } from "./express/expressConfigs.js"
import { mergeMultipleViteConfig } from "./vite/mergeMultipleViteConfig.js"
import { viteCoreOptions } from "./vite/viteCoreConfig.js"
import { viteOptimizeOptions } from "./vite/viteOptimizeConfig.js"

export function resolveAlbumViteConfig(context: AlbumContext, forceClient = false) {
  const { userConfig } = context
  return mergeMultipleViteConfig([
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
  ])
}

export async function resolveMiddlewareConfig(context: AlbumContext, forceClient = false) {
  const { pluginManager, userConfig, getStaticInfo } = context
  const { midConfigs, viteConfigs } = await pluginManager.execute("serverConfig", {
    info: getStaticInfo(),
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
  })
  return { midConfigs, viteConfigs: mergeMultipleViteConfig(viteConfigs) }
}
