import { readFile } from "fs/promises"
import { dirname, resolve } from "path"
import { isStringEmpty } from "../check/simple.js"
import { Obj } from "../types/types.js"

export async function resolveTsconfigPaths(tsconfigPath: string, root?: string) {
  const alias: Obj<string> = {}
  const { paths, baseUrl = "." } = JSON.parse(await readFile(tsconfigPath, "utf-8"))?.compilerOptions
  if (paths) {
    const resolvePath = (p: string) => resolve(root ?? dirname(tsconfigPath), baseUrl, p)
    for (let key in paths) {
      if (isStringEmpty(paths[key])) continue
      const aKey = key.replace("/*", "")
      const aVal: string = paths[key][0].replace("/*", "")
      alias[aKey] = resolvePath(aVal.startsWith("/") ? aVal.slice(1) : aVal)
    }
  }
  return alias
}
