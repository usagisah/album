import { existsSync } from "fs"
import { stat } from "fs/promises"
import { resolve } from "path"
import { StartConfig } from "./start.type.js"

export async function checkStartConfig(cwd: string, config: StartConfig) {
  const { root } = config
  let _root = cwd
  if (root) {
    _root = resolve(cwd, root)
    try {
      const info = await stat(_root)
      if (!info.isDirectory()) throw `配置文件指定的根路径不是合法的文件夹(${_root})`
    } catch (e) {
      throw ["查找生产环境服务器启动入口失败", e]
    }
  } else {
    const distPath = resolve(cwd, "dist")
    if (existsSync(distPath)) _root = distPath
  }
  return { root: _root }
}
