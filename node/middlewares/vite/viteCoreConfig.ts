import { InlineConfig, PluginOption, mergeConfig } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { AlbumServerViteConfig } from "../middlewares.type.js"
import { proxyLogger } from "./proxyLogger.js"
import { createSPACoreConfig } from "./spaConfig.js"
import { createSSRCoreConfig } from "./ssrConfig.js"

const configName = "album:core"
export function viteCoreOptions(context: AlbumContext, forceClient = false): AlbumServerViteConfig {
  const { appId, serverMode, ssr, ssrCompose, inputs, env, logger } = context
  const { cwd } = inputs
  const [_config, pluginOptions] = !forceClient && ssr ? createSSRCoreConfig(context) : createSPACoreConfig(context)
  const basePlugins: PluginOption = {
    name: configName,
    configResolved: config => (Object.assign(config.env, env), undefined)
  }
  for (const key of Object.getOwnPropertyNames(pluginOptions)) {
    if (key === "name") continue
    basePlugins[key] = pluginOptions![key]
  }

  const baseConfig: InlineConfig = {
    base: ssrCompose && serverMode === "build" ? appId : undefined,
    root: cwd,
    server: {
      middlewareMode: true,
      watch: {
        interval: 800,
        binaryInterval: 1000,
        useFsEvents: true
      }
    },
    define: {
      __app_id__: `"${appId}"`,
      __app_id_path__: `"/${appId}"`
    },
    logLevel: serverMode === "build" ? "error" : "info",
    customLogger: serverMode === "build" ? undefined : proxyLogger(logger),
    plugins: [basePlugins]
  }
  return { name: configName, config: mergeConfig(baseConfig, _config) }
}
