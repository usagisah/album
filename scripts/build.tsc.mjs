import { execa } from "execa"
import { rmSync } from "fs"
import { readFile, rm, writeFile } from "fs/promises"
import { cpFiles, resolvePath } from "./helper.mjs"

export async function buildCore() {
  rmSync(resolvePath("album/dist"), { force: true, recursive: true })

  await execa("tsc", ["--p", resolvePath("album/client/tsconfig.json")], {
    stdout: process.stdout,
    stderr: process.stderr
  })

  await execa("tsc", ["--p", resolvePath("album/node/tsconfig.json")], {
    stdout: process.stdout,
    stderr: process.stderr
  })

  cpFiles(resolvePath("album"), ["node_modules", "package.json"], ["types"], "dist")
  const pkgPath = resolvePath("album/dist/package.json")
  const file = JSON.parse(await readFile(pkgPath, "utf-8"))
  file.name = "albumjs"
  await writeFile(pkgPath, JSON.stringify(file, null, 2), "utf-8")
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
