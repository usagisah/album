import { AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { green, red } from "@albumjs/tools/lib/colorette"
import { copy } from "@albumjs/tools/lib/fs-extra"
import { createCommonJS } from "@albumjs/tools/lib/mlly"
import ora from "@albumjs/tools/lib/ora"
import react from "@vitejs/plugin-react-swc"
import { rm } from "fs/promises"
import { resolve } from "path"
import { buildPages } from "./build/buildPages.js"
import { renderDemos } from "./build/renderDemos.js"
import { renderPages } from "./build/renderPages.js"
import { DEFAULT_COPY_TEXT } from "./constants.js"
import { DocsConfig, PluginContext } from "./docs.type.js"
import { normalizeDocsConfig } from "./normalizeDocsConfig.js"
import { parseModules } from "./parser/parseModules.js"
import AlbumReactDocsVitePlugin, { ParseMDConfig } from "./vite.js"

export interface PluginReactDocsConfig {
  md?: ParseMDConfig
  react?: Parameters<typeof react>[0]
  docs?: DocsConfig
}

const { __dirname } = createCommonJS(import.meta.url)
export default function pluginReactDocs(config: PluginReactDocsConfig = {}): AlbumUserPlugin {
  const { md, docs = {} as any, react = {} } = config
  const context: PluginContext = {
    parseMDConfig: {
      className: md?.className ?? "className",
      copyText: md?.copyText ?? DEFAULT_COPY_TEXT
    },
    docsConfig: normalizeDocsConfig(docs),
    reactConfig: react,
    routes: [],
    routeMap: new Map(),
    albumContext: null,
    demos: []
  }
  const { locales } = context.docsConfig.siteConfig.lang
  const langDirs = Object.keys(locales).filter(v => v !== "root")
  return {
    name: "album:plugin-react-docs",

    config(c) {
      const { config } = c
      if (config.ssrCompose) {
        console.error(red("使用 plugin-react-docs 插件时，禁止开启 ssr-compose 功能"))
      }
      c.config = mergeConfig(config, {
        app: {
          module: {
            path: "contents",
            pageFilter: /\.md$/,
            fileExtensions: [/\.md/],
            iteration: "flat",
            ignore: langDirs
          }
        },
        ssrCompose: undefined,
        server: { builtinModules: false }
      })
      if (langDirs.length > 0) {
        c.config = mergeConfig(c.config, {
          app: {
            module: langDirs.map(k => {
              return {
                path: "contents/" + k,
                pageFilter: /\.md$/,
                fileExtensions: [/\.md/],
                iteration: "flat",
                ignore: langDirs.filter(v => v !== k)
              }
            })
          }
        })
      }
    },

    context({ albumContext }) {
      context.albumContext = albumContext
    },

    async initClient({ info, dumpFileManager, appFileManager, appManager }) {
      const name = "plugin-react-docs"
      await dumpFileManager.add("dir", name, { create: false })

      const [{ routes, routeMap }] = await Promise.all([
        parseModules(appManager.specialModules, context, langDirs),
        copy(resolve(__dirname, "../app"), resolve(info.inputs.dumpInput, name), { overwrite: true }),
        appFileManager.setFile("album-env.d.ts", f => {
          const typePlugin = `/// <reference types=".album/plugin-react-docs/plugin-react-docs" />`
          return f.includes(typePlugin) ? f : `${f}${typePlugin}\n`
        })
      ])
      context.routes = routes
      context.routeMap = routeMap
    },

    async patchClient({ updateInfo, appManager, logger }) {
      const { routes, routeMap } = await parseModules(appManager.specialModules, context, langDirs)
      context.routes = routes
      context.routeMap = routeMap

      if (updateInfo.type === "add") {
        logger.log(`add content: ${updateInfo.path}`, "plugin-react-docs")
      }
    },

    async serverConfig(c) {
      const { dumpInput } = context.albumContext.inputs
      c.viteConfigs.push({
        name: "plugin-react",
        config: {
          build: {
            emptyOutDir: false
          },
          resolve: {
            alias: {
              "album.docs": resolve(dumpInput, "plugin-react-docs/hooks/useAppContext.tsx")
            }
          },
          plugins: [AlbumReactDocsVitePlugin(context)]
        }
      })
    },

    async buildStart(p) {
      p.forceQuit = true

      const { info } = p
      const { inputs } = info

      const spinner = ora(green("building docs pages...")).start()
      const map = await buildPages(p, context)
      spinner.succeed()

      spinner.start(green("render docs pages..."))
      await renderPages(map, p, context)
      spinner.succeed()

      if (context.demos.length > 0) {
        spinner.start(green("render docs demos..."))
        await renderDemos(p, context)
        spinner.succeed()
      }

      spinner.start(green("clear temp cache..."))
      await Promise.all([rm(resolve(inputs.cwd, ".swc"), { force: true, recursive: true }), rm(resolve(inputs.cwd, ".temp"), { force: true, recursive: true })])
      spinner.succeed()
    }
  }
}
