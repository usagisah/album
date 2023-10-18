import { cpSync, existsSync, mkdirSync, symlinkSync } from "fs"
import { resolve } from "path"

const cwd = process.cwd()
const output = resolve(cwd, "album")

export function cpFiles(files, links) {
  if (!existsSync(output)) mkdirSync(output)
  for (const f of files) {
    const dest = resolve(output, f)
    if (existsSync(dest)) {
      continue
    }

    cpSync(resolve(cwd, f), dest, {
      recursive: true
    })
  }

  for (const f of links) {
    const dest = resolve(output, f)
    if (existsSync(dest)) {
      continue
    }

    symlinkSync(resolve(cwd, f), resolve(output, f))
  }
}
