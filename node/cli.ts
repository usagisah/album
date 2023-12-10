export * from "./cli/build/albumBuild.js"
export * from "./cli/cli.type.js"
export * from "./cli/dev/dev.js"
export * from "./cli/start/start.js"
export * from "./client/client.type.js"
export * from "./context/context.type.js"
export * from "./context/userConfig/mergeConfig.js"
export * from "./plugins/plugin.type.js"

import { AlbumUserConfig } from "./context/userConfig/userConfig.type.js"
export function defineConfig(config: AlbumUserConfig) {
  return config
}

export * from "./plugins/album/pluginAlbumExpress.js"
export * from "./plugins/album/pluginAlbumVite.js"
