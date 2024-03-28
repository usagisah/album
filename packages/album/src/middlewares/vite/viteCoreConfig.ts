import { resolve } from "path"
import { InlineConfig, PluginOption, mergeConfig } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { AlbumServerViteConfig } from "../middlewares.type.js"
import { proxyLogger } from "./proxyLogger.js"
import { createSPACoreConfig } from "./spaConfig.js"
import { createSSRCoreConfig } from "./ssrConfig.js"

const configName = "album:core"
export function viteCoreOptions(context: AlbumContext, forceClient = false): AlbumServerViteConfig {
  const { appId, serverMode, ssr, ssrCompose, inputs, env, logger } = context
  const { cwd, dumpInput } = inputs
  const [_config, pluginOptions] = !forceClient && ssr ? createSSRCoreConfig(context) : createSPACoreConfig(context)

  const basePlugins: PluginOption = {
    name: configName,
    config(config) {
      if (serverMode === "build") {
        if (!config.define) {
          config.define = {}
        }
        for (const k in env) {
          config.define["import.meta.env." + k] = `"${env[k]}"`
        }
      }
    },
    configResolved: config => {
      ;(config as any).env = { ...env, ...config.env }
    }
  }
  for (const key of Object.getOwnPropertyNames(pluginOptions)) {
    if (key === "name") continue
    basePlugins[key] = pluginOptions![key]
  }

  const baseConfig: InlineConfig = {
    mode: serverMode === "dev" ? "development" : "production",
    base: ssrCompose && serverMode === "build" ? appId : undefined,
    root: cwd,
    configFile: false,
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
      __app_id_path__: `"/${appId}"`,
      __ssr_compose__: ssrCompose,
      "process.env.NODE_ENV": serverMode === "dev" ? `"development"` : `"production"`
    },
    resolve: {
      alias: {
        album: resolve(dumpInput, "album.client.ts"),
        "album.server": resolve(dumpInput, "album.server.ts"),
        "album.dependency": resolve(dumpInput, "album.dependency.ts")
      }
    },
    logLevel: serverMode === "build" ? "error" : "info",
    customLogger: serverMode === "build" ? undefined : proxyLogger(logger),
    plugins: [basePlugins]
  }
  return { name: configName, config: mergeConfig(baseConfig, _config) }
}
