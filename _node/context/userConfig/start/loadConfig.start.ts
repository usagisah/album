import { existsSync } from "fs"
import { resolve } from "path"
import { SSRComposeDependencies } from "../../../ssrCompose/ssrCompose.type.js"
import { isPlainObject } from "../../../utils/check/simple.js"
import { StartCacheUserConfig } from "../userConfig.type.js"

type Config = StartCacheUserConfig & { ssrComposeDependencies?: SSRComposeDependencies }

export async function loadConfig() {
  const configPath = resolve(process.cwd(), "album.config.js")
  if (!existsSync(configPath)) throw "找不到生产配置文件"

  const config: Config = await import(configPath).then(m => m.default)
  if (!isPlainObject(config)) throw "似乎到了个不是一个合法的配置文件"

  return config
}
