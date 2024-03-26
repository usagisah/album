import { AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import { copy } from "@albumjs/tools/lib/fs-extra"
import { createCommonJS } from "@albumjs/tools/lib/mlly"
import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"
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
  const { md = {}, docs = {} as any, react = {} } = config
  const context: PluginContext = {
    parseMDConfig: {
      className: md.className ?? "className",
      copyText: md.copyText ?? DEFAULT_COPY_TEXT
    },
    docsConfig: normalizeDocsConfig(docs),
    reactConfig: react,
    outDir: null,
    records: [],
    recordMap: new Map(),
    albumContext: null
  }
  return {
    name: "album:plugin-react-docs",

    config(config) {
      if (config.config.ssrCompose) {
        console.error(red("使用 plugin-react-docs 插件时，禁止开启 ssr-compose 功能"))
      }
      config.config = mergeConfig(config.config, {
        app: {
          module: {
            fileExtensions: [/\.md/]
          }
        },
        ssrCompose: undefined,
        server: { builtinModules: false }
      })
    },

    // async findEntries(config) {
    //   const { inputs } = config
    //   const { dumpInput } = inputs
    //   config.main = resolve(dumpInput, "plugin-react-docs/main.tsx")
    // },

    context({ albumContext }) {
      context.albumContext = albumContext
      // albumContext.watcher
      //   .on("add", p => {})
      //   .on("change", p => {})
      //   .on("unlink", p => {})
      //   .on("unlinkDir", p => {})
    },

    async initClient({ info, dumpFileManager, appFileManager, appManager }) {
      const name = "plugin-react-docs"
      await dumpFileManager.add("dir", name, { create: false })

      const outDir = (context.outDir = resolve(info.inputs.dumpInput, name))
      await Promise.all([
        copy(resolve(__dirname, "../app"), outDir, { overwrite: true }),
        appFileManager.setFile("album-env.d.ts", f => {
          const typePlugin = `/// <reference types=".album/plugin-react-docs/plugin-react-docs" />`
          return f.includes(typePlugin) ? f : `${f}${typePlugin}\n`
        }),
        parseModules(appManager.specialModules, context)
      ])
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
    }
  }
}

export interface AlbumDocsConfig {
  docs?: DocsConfig
}
