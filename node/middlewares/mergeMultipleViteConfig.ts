import { mergeConfig } from "vite"
import { PluginViteConfig } from "./middlewares.type.js"

export function mergeMultipleViteConfig(configs: PluginViteConfig[]) {
  let config = configs[0].options
  for (let index = 1; index < configs.length; index++) {
    const _config = configs[index].options
    config = mergeConfig(config, _config)
  }
  return config
}
