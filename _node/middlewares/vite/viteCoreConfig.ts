import { InlineConfig, PluginOption, mergeConfig } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"
import { AlbumServerViteConfig } from "../middlewares.type.js"
import { proxyLogger } from "./proxyLogger.js"
import { createSPACoreConfig } from "./spaConfig.js"
import { createSSRCoreConfig } from "./ssrConfig.js"

const configName = "album:core"
export function viteCoreOptions(context: AlbumDevContext, forceClient = false): AlbumServerViteConfig {
  const { info, logger } = context
  const { appId, serverMode, inputs, env, ssr, ssrCompose } = info
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

  let base = "/"
  let defineBase = '""'
  if (ssrCompose && serverMode === "build") {
    base = `/${appId}`
    defineBase = `"/${appId}"`
  }

  const baseConfig: InlineConfig = {
    base,
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
      __app_id__: appId,
      __base_path__: ssrCompose && serverMode === "build" ? `"/${appId}"` : '""'
    },
    logLevel: serverMode === "build" ? "error" : "info",
    customLogger: serverMode === "build" ? undefined : proxyLogger(logger),
    plugins: [basePlugins]
  }
  return { name: configName, config: mergeConfig(baseConfig, _config) }
}
