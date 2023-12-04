import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { Plugin, mergeConfig } from "vite"

type Config = {
  cwd?: string
}

export function tsconfigPath(config?: Config): Plugin {
  const { cwd = process.cwd() } = config ?? {}
  return {
    name: "album:tsconfigPath",
    async config(config) {
      const tsconfigPath = resolve(cwd, "tsconfig.json")
      if (!existsSync(tsconfigPath)) return

      try {
        const { paths, baseUrl = "." } = JSON.parse(await readFile(tsconfigPath, "utf-8"))?.compilerOptions
        if (!paths) return

        const resolvePath = (p: string) => resolve(process.cwd(), baseUrl, p)
        const alias = {}
        for (const p in paths) alias[p.slice(0, -2)] = resolvePath(paths[p][0].slice(2, -2))
        return mergeConfig(config, { resolve: { alias } })
      } catch {}
    }
  }
}
