import { cpSync, existsSync, mkdirSync, symlinkSync } from "fs"
import { resolve } from "path"

const cwd = process.cwd()
export function resolvePath(...p) {
  return resolve(cwd, "packages", ...p)
}

export function cpFiles(root, files, links, to) {
  const outDir = resolve(root, to)
  if (!existsSync(outDir)) {
    mkdirSync(outDir)
  }

  for (const f of files) {
    const dest = resolve(outDir, f)
    if (!existsSync(dest)) {
      cpSync(resolvePath(root, f), dest, { recursive: true })
    }
  }

  for (const f of links) {
    const dest = resolve(outDir, f)
    if (!existsSync(dest)) {
      symlinkSync(resolvePath(root, f), dest)
    }
  }
}
