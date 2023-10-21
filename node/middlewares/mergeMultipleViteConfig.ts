import { mergeConfig } from "vite"
import { ViteConfigs } from "./middlewares.type.js"

export function mergeMultipleViteConfig(configs: ViteConfigs[]) {
  let config = configs[0].options
  for (let index = 1; index < configs.length; index++) {
    const _config = configs[index].options
    config = mergeConfig(config, _config)
  }
  return config
}
