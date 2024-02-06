import { dirname, resolve } from "path"
import { isArray, isPlainObject, isString } from "../check/simple.js"
import { readJson } from "../fs/readJson.js"
import { Obj } from "../types/types.js"

export async function resolveTsconfigPaths(tsconfigPath: string, root?: string): Promise<Obj<string>>
export async function resolveTsconfigPaths(tsconfig: Obj, root?: string): Promise<Obj<string>>
export async function resolveTsconfigPaths(tsconfigPath: unknown, root?: string): Promise<Obj<string>>
export async function resolveTsconfigPaths(tsconfig: any, root?: string): Promise<Obj<string>> {
  const alias: Obj<string> = {}
  const _config = isPlainObject(tsconfig) ? tsconfig : await readJson(tsconfig)
  if (!_config) return alias

  const _root = isString(root) ? root : isString(tsconfig) ? dirname(tsconfig) : process.cwd()
  const { paths, baseUrl = "." } = _config.compilerOptions
  if (paths) {
    const resolvePath = (p: string) => resolve(_root, baseUrl, p)
    for (let key in paths) {
      const val = paths[key]
      if (!isArray(val) || val.length === 0) continue
      const aKey = key.replace("/*", "")
      const aVal: string = paths[key][0].replace("/*", "")
      alias[aKey] = resolvePath(aVal.startsWith("/") ? aVal.slice(1) : aVal)
    }
  }
  return alias
}
