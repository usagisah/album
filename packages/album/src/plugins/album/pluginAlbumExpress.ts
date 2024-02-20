import { Func, isPlainObject } from "@albumjs/tools/node"
import { CompressionOptions } from "compression"
import { HelmetOptions } from "helmet"
import { Options as SirvOptions } from "sirv"
import { AlbumUserPlugin } from "../plugin.dev.type.js"

export type PluginAlbumExpressConfig = {
  helmet?: { enable?: boolean } & HelmetOptions
  compression?: { enable?: boolean } & CompressionOptions
  sirv?: SirvOptions | Func<[SirvOptions], SirvOptions>
}

export function pluginAlbumExpress(config?: PluginAlbumExpressConfig): AlbumUserPlugin {
  let { helmet, compression, sirv } = isPlainObject(config) ? config : ({} as PluginAlbumExpressConfig)
  if (!isPlainObject(helmet)) helmet = undefined
  if (!isPlainObject(compression)) helmet = undefined
  if (!isPlainObject(sirv)) helmet = undefined
  return {
    name: "album:builtin-album",
    async serverConfig({ midConfigs }) {
      if (helmet) {
        const _config = midConfigs.find(v => v.name === "helmet")
        if (_config) Object.assign(_config.config, helmet)
      }

      if (compression) {
        const _config = midConfigs.find(v => v.name === "compression")
        if (_config) Object.assign(_config.config, compression)
      }

      if (sirv) {
        const _config = midConfigs.find(v => v.name === "sirv")
        if (_config) Object.assign(_config.config, sirv)
      }
    }
  }
}
