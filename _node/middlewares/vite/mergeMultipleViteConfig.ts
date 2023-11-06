import { mergeConfig } from "vite"
import { AlbumServerViteConfig } from "../middlewares.type.js"

export function mergeMultipleViteConfig(configs: AlbumServerViteConfig[]) {
  let c = configs[0].config
  for (let index = 1; index < configs.length; index++) c = mergeConfig(c, configs[index].config)
  return c
}
