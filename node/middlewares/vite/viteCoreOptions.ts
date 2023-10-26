import { readFileSync, writeFileSync } from "fs"
import { relative, resolve } from "path"
import { InlineConfig, PluginOption, createLogger } from "vite"
import { AlbumContext } from "../../context/AlbumContext.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { PluginViteConfig } from "../middlewares.type.js"

export function viteCoreOptions(context: AlbumContext, forceClient = false): PluginViteConfig {
  const { app, mode, serverMode, inputs, status, logger, configs } = context
  const { cwd } = inputs
  const { env } = status
  const { ssrCompose } = configs
  const [preferConfig, pluginApi] = !forceClient && status.ssr ? ssrOptions(context) : spaOptions(context)

  const albumVitePlugin: PluginOption = {
    name: "album-plugin",
    configResolved(config) {
      Object.assign(config.env, env)
    }
  }
  for (const key of Object.getOwnPropertyNames(pluginApi)) {
    if (key === "name") continue
    const pg = pluginApi[key]
    albumVitePlugin[key] = (...props: any[]) => {
      return pg(...props)
    }
  }

  const options: InlineConfig = {
    base: ssrCompose ? app : "./",
    root: cwd,
    server: {
      middlewareMode: true,
      watch:
        mode === "production"
          ? undefined
          : {
              interval: 800,
              binaryInterval: 1000,
              useFsEvents: true
            }
    },
    logLevel: "info",
    customLogger: serverMode === "build" ? null : createViteLogger(logger),
    plugins: [albumVitePlugin],
    ...preferConfig
  }

  return {
    name: "albumCoreConfig",
    options
  }
}

function spaOptions(context: AlbumContext): [InlineConfig, PluginOption] {
  const { mode, status, inputs, outputs } = context
  const { ssr } = status
  const { cwd, realClientInput } = inputs
  const { clientOutDir } = outputs

  const devConfig: InlineConfig = {
    appType: ssr ? "custom" : "spa",
    build: {
      manifest: ssr,
      outDir: clientOutDir,
      rollupOptions: {
        input: ssr ? realClientInput : undefined
      }
    }
  }

  const prodConfig: InlineConfig = {
    appType: ssr ? "custom" : "spa",
    build: {
      manifest: ssr,
      outDir: clientOutDir,
      rollupOptions: {
        input: ssr ? realClientInput : undefined
      }
    }
  }

  const devPlugin: PluginOption = {
    name: "",
    transformIndexHtml(html) {
      return html.replace("</body>", `<script type="module" src="/${relative(cwd, realClientInput)}"></script></body>`)
    }
  }

  let html = ""
  const prodPlugin: PluginOption = {
    name: "",
    buildStart() {
      if (ssr) return
      html = readFileSync(resolve(cwd, "index.html"), "utf-8")
      writeFileSync(resolve(cwd, "index.html"), html.replace("</body>", `<script type="module" src="/${relative(cwd, realClientInput)}"></script></body>`), "utf-8")
    },
    buildEnd() {
      if (ssr) return
      writeFileSync(resolve("index.html"), html, "utf-8")
    }
  }

  return mode === "production" ? [prodConfig, prodPlugin] : [devConfig, devPlugin]
}

function ssrOptions(context: AlbumContext): [InlineConfig, PluginOption] {
  const {
    mode,
    inputs: { realSSRInput },
    outputs
  } = context
  const { ssrOutDir } = outputs
  const devConfig: InlineConfig = {
    appType: "custom",
    build: {
      ssr: true,
      outDir: ssrOutDir,
      rollupOptions: {
        input: realSSRInput
      }
    }
  }
  const prodConfig: InlineConfig = {
    appType: "custom",
    build: {
      ssr: true,
      outDir: ssrOutDir,
      rollupOptions: {
        input: realSSRInput
      }
    }
  }
  const plugin: PluginOption = { name: "" }

  return [mode === "production" ? prodConfig : devConfig, plugin]
}

function createViteLogger(logger: ILogger) {
  const viteLogger = createLogger()
  viteLogger.info = msg => logger.log(msg, "album")
  viteLogger.error = msg => logger.error(msg, "album")
  viteLogger.warn = msg => logger.warn(msg, "album")
  return viteLogger
}
