import { existsSync, readdirSync } from "fs"
import { parse as pathParse, resolve } from "path"

export type FindEntryPath = {
  cwd: string
  name: string
  presets?: string[]
  exts?: string[]
}

export async function findEntryPath(props: FindEntryPath): Promise<null | string> {
  const { cwd, name, presets = ["./", "src"], exts = [".js", ".mjs"] } = props
  if (exts.length === 0) exts.push("")
  for (const preset of presets) {
    for (const ext of exts) {
      const filePath = resolve(cwd, preset, name + ext)
      if (existsSync(filePath)) return filePath
    }
  }
  return null
}

export type FindExtEntryPath = {
  cwd: string
  presets: string[]
  suffixes: string[]
}
export async function findEndEntryPath(props: FindExtEntryPath): Promise<null | string> {
  const { cwd, presets, suffixes } = props
  for (const preset of presets) {
    const dirPath = resolve(cwd, preset)
    if (!existsSync(dirPath)) continue

    for (const file of readdirSync(dirPath, { encoding: "utf-8", withFileTypes: true })) {
      for (const suffix of suffixes) {
        const { name, ext } = pathParse(file.name)
        if (file.isFile() && (ext.length > 1 ? name.endsWith("." + suffix) : name === suffix)) {
          return resolve(dirPath, file.name)
        }
      }
    }
  }
  return null
}
