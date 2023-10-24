import { existsSync } from "fs"
import { resolve } from "path"

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
