import { AlbumContext, AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import { createCommonJS } from "@albumjs/tools/lib/mlly"
import { resolve } from "path"
import AlbumReactDocsVitePlugin, { ReactDocsConfig } from "./vite.js"

export interface PluginReactDocsConfig extends ReactDocsConfig {}

const { __dirname } = createCommonJS(import.meta.url)
export default function pluginReactDocs(config: PluginReactDocsConfig = {}): AlbumUserPlugin {
  let albumContext: AlbumContext

  return {
    name: "album:plugin-react-docs",
    config(config) {
      if (config.config.ssrCompose) {
        console.error(red("使用 plugin-react-docs 插件时，禁止开启 ssr-compose 功能"))
      }
      config.config = mergeConfig(config.config, { ssrCompose: undefined, server: { builtinModules: false } })
    },
    async findEntries(config) {
      config.main = config.mainSSR = " "
      config.module = {}
    },
    context(param) {
      const ctx = (albumContext = param.albumContext)
      ctx.watcher
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
