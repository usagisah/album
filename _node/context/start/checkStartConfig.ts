import { stat } from "fs/promises"
import { resolve } from "path"
import { StartConfig } from "./start.type.js"

export async function checkStartConfig(cwd: string, config: StartConfig) {
  const { root } = config
  const p = resolve(cwd, root)
  try {
    const info = await stat(p)
    if (!info.isDirectory()) throw `指定的根路径不是合法的文件夹:(${p})`
  } catch (e) {
    throw ["查找生产环境服务器启动入口失败", e]
  }

  return { root: p }
}
