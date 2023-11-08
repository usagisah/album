import { AlbumDevContext } from "../context.type.js"
import { StartConfig } from "./start.type.js"

export function buildStartConfig(context: AlbumDevContext) {
  const { userConfig } = context
  if (!userConfig.start || !userConfig.start.root) return { root: "./" }

  const { root } = userConfig.start
  return { root } as StartConfig
}
