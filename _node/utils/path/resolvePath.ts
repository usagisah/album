import { existsSync } from "fs"
import { resolve } from "path"

export type ResolveFilePathParams = {
  root?: string
  prefixes?: string[]
  name?: string
  suffixes?: string[]
  exts?: string[]
  realPath?: boolean
}

export async function resolveFilePath(params: ResolveFilePathParams): Promise<null | string> {
  const { root = process.cwd(), name = "", prefixes = ["./", "src"], suffixes, exts = [".js", ".mjs"], realPath } = params
  if (!name && (!suffixes || suffixes.length === 0)) return null
  for (const prefix of prefixes) {
    for (const ext of exts) {
      for (const suffix of buildSuffixes(suffixes)) {
        const filePath = resolve(root, prefix, name + suffix + ext)
        if (existsSync(filePath)) {
          if (realPath) return (await import("./resolveRealPath.js")).resolveRealPath(filePath)
          return filePath
        }
      }
    }
  }
  return null
}

export type ResolveDirPathParams = {
  root?: string
  prefixes?: string[]
  suffixes?: string[]
  name?: string
  realPath?: boolean
}

export async function resolveDirPath(params: ResolveDirPathParams) {
  const { root = process.cwd(), name = "", prefixes = ["./", "src"], suffixes, realPath } = params ?? {}
  if (!name && (!suffixes || suffixes.length === 0)) return null
  for (const prefix of prefixes) {
    for (const suffix of buildSuffixes(suffixes)) {
      const dirPath = resolve(root, prefix, name + suffix)
      if (existsSync(dirPath)) {
        if (realPath) return (await import("./resolveRealPath.js")).resolveRealPath(dirPath)
        return dirPath
      }
    }
  }
  return null
}

function buildSuffixes(suffix?: string[]) {
  if (!suffix) return [""]
  return [...suffix, ...suffix.map(v => (v.startsWith(".") ? suffix.slice(1) : `.${v}`))]
}
