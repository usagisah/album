import { execa } from "execa"
import { rmSync } from "fs"
import { rm } from "fs/promises"
import { cpFiles, resolvePath } from "./helper.mjs"

async function buildCore() {
  rmSync(resolvePath("album/dist"), { force: true, recursive: true })

  await execa("tsc", ["--p", resolvePath("album/client/tsconfig.json")], {
    stdout: process.stdout,
    stderr: process.stderr
  })

  await execa("tsc", ["--p", resolvePath("album/node/tsconfig.json")], {
    stdout: process.stdout,
    stderr: process.stderr
  })

  cpFiles(resolvePath("album"), ["package.json"], ["node_modules", "types"], "dist")
}

export async function build(ps) {
  for (const pkg of ps) {
    if (pkg === "album") {
      await buildCore()
    }

    if (["tools", "plugin-react"].includes(pkg)) {
      await rm(resolvePath(`${pkg}/dist`), { force: true, recursive: true })
      await execa("tsc", ["--p", resolvePath(`${pkg}/tsconfig.json`)], {
        stdout: process.stdout,
        stderr: process.stderr
      })
    }
  }
}
