import { existsSync } from "fs"
import { lstat, readlink } from "fs/promises"
import { resolve } from "path"

export async function resolveRealPath(path: string, cwd?: string) {
  if (!existsSync(path)) throw "resolveRealPath.path 指定路径不存在"
  const realPath = await _resolveRealPath(path)
  return cwd ? resolve(cwd ?? "", realPath) : realPath
}

async function _resolveRealPath(path: string) {
  try {
    return (await lstat(path)).isSymbolicLink() ? _resolveRealPath(await readlink(path)) : path
  } catch {
    return path
  }
}
