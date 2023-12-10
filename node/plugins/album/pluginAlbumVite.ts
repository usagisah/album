import compression from "vite-plugin-compression"
import { isPlainObject } from "../../utils/check/simple.js"
import { AlbumUserPlugin } from "../plugin.type.js"

type VitePluginCompression = Parameters<typeof compression.default>

type PluginAlbumViteConfig = {
  compression?: { enable: boolean } & VitePluginCompression
}

export function pluginAlbumVite(config?: PluginAlbumViteConfig): AlbumUserPlugin {
  let { compression: compressionConfig } = isPlainObject(config) ? config : ({} as PluginAlbumViteConfig)
  if (!isPlainObject(compressionConfig)) compressionConfig = undefined
  return {
    name: "album:builtin-vite",
    async serverConfig({ viteConfigs }) {
      if (compressionConfig) {
        const c = viteConfigs.find(v => v.name === "album:optimize")!.config
        const index = c.plugins!.findIndex((v: any) => v.name === "vite:compression")
        if (index > -1) {
          c[index] = (compression as any)(compressionConfig)
        } else if (compressionConfig.enable) {
          c.plugins!.push((compression as any)(compressionConfig))
        }
      }
    }
  }
}
