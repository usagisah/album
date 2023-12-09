import { parse } from "@ungap/structured-clone/json"
import { readFile } from "fs/promises"
import { isPlainObject } from "../../../utils/check/simple.js"
import { resolveFilePath } from "../../../utils/path/resolvePath.js"
import { StartCacheUserConfig } from "../userConfig.type.js"

export async function loadConfig(root: string) {
  const configPath = await resolveFilePath({
    root,
    prefixes: [""],
    name: "album.config",
    exts: ["js"]
  })
  if (!configPath) throw "找不到生产配置文件"

  const config: StartCacheUserConfig = parse(await readFile(configPath, "utf-8"))
  if (!isPlainObject(config)) throw "似乎找到了个非法的配置文件"

  return config
}
