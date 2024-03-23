import { AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import { copy } from "@albumjs/tools/lib/fs-extra"
import { createCommonJS } from "@albumjs/tools/lib/mlly"
import { resolve } from "path"
import AlbumReactDocsVitePlugin, { ReactDocsConfig } from "./vite.js"
import { PluginContext } from "./docs.type.js"

export interface PluginReactDocsConfig extends ReactDocsConfig {}

const { __dirname } = createCommonJS(import.meta.url)
export default function pluginReactDocs(config: PluginReactDocsConfig = {}): AlbumUserPlugin {
  const context: PluginContext = {
    outDir: "",
    records: [],
    recordMap: new Map()
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
            pageFilter: /\w+/,
            fileExtensions: [/\.md/]
          }
        },
        ssrCompose: undefined,
        server: { builtinModules: false }
      })
    },
    async findEntries(config) {
      const { inputs } = config
      const { dumpInput } = inputs
      config.main = resolve(dumpInput, "plugin-react-docs/main.tsx")
      config.mainSSR = resolve(dumpInput, "plugin-react-docs/main.ssr.tsx")
    },
    context({ albumContext }) {
      albumContext.watcher
        .on("add", p => {})
        .on("change", p => {})
        .on("unlink", p => {})
        .on("unlinkDir", p => {})
    },
    async initClient({ info, dumpFileManager }) {
      const name = "plugin-react-docs"
      await dumpFileManager.add("dir", name, { create: false })

      const outDir = resolve(info.inputs.dumpInput, name)
      await copy(resolve(__dirname, "../app"), outDir)
    },
    async serverConfig(c) {
      c.viteConfigs.push({
        name: "plugin-react",
        config: {
          build: {
            emptyOutDir: false
          },
          resolve: {
            alias: {
              "album.docs": resolve(__dirname, "../app/hooks/useAppContext.tsx")
            }
          },
          plugins: [AlbumReactDocsVitePlugin(config)]
        }
      })
    }
  }
}
