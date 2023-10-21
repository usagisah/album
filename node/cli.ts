export * from "./cli/build/albumBuild.js"
export { AlbumServerParams } from "./cli/cli.type.js"
export * from "./cli/dev/dev.js"
export * from "./cli/start/start.js"
export type * from "./client/client.out.js"
export * from "./constants/constants.out.js"
export type * from "./context/context.out.js"
export type * from "./middlewares/middlewares.out.js"
export type * from "./modules/modules.out.js"

import { UserConfig } from "./context/AlbumContext.type.js"
export function defineConfig(config: UserConfig) {
  return config
}
