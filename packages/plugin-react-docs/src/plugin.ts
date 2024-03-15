import { AlbumContext, AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import viteReactPlugin from "@vitejs/plugin-react-swc"

type PluginProps<T> = T extends (props: infer P) => any ? P : never

export type PluginReactDocs = {
  pluginReact?: PluginProps<typeof viteReactPlugin>
}

/* 
express mid
vite mid

hot 更新，非 md 部分
*/
export default function pluginReactDocs(config: PluginReactDocs = {}): AlbumUserPlugin {
  const { pluginReact } = config
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
    async serverConfig(params) {
      params.viteConfigs.push({
        name: "plugin-react",
        config: {
          build: {
            emptyOutDir: false
          },
          plugins: [viteReactPlugin(pluginReact) as any]
        }
      })
    }
  }
}
