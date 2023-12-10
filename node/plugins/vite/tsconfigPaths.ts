import { existsSync } from "fs"
import { resolve } from "path"
import { Plugin, mergeConfig } from "vite"
import { resolveTsconfigPaths } from "../../utils/path/resolveTsconfigPaths.js"

type TsconfigPathConfig = {
  cwd?: string
}

export function tsconfigPath(config?: TsconfigPathConfig): Plugin {
  const { cwd = process.cwd() } = config ?? {}
  return {
    name: "album:tsconfigPath",
    async config(config) {
      const tsconfigPath = resolve(cwd, "tsconfig.json")
      if (!existsSync(tsconfigPath)) return

      const alias = await resolveTsconfigPaths(tsconfigPath)
      return mergeConfig(config, { resolve: { alias } })
    }
  }
}
