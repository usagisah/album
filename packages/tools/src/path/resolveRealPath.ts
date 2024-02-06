import { existsSync } from "fs"
import { lstat, readlink } from "fs/promises"

export async function resolveRealPath(path: string) {
  if (!existsSync(path)) throw "resolveRealPath.path 指定路径不存在"
  return _resolveRealPath(path)
}

async function _resolveRealPath(path: string): Promise<string> {
  try {
    return (await lstat(path)).isSymbolicLink() ? _resolveRealPath(await readlink(path)) : path
  } catch {
    return path
  }
}
