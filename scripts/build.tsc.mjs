import { execa } from "execa"
import { rm } from "fs/promises"
import { resolvePath } from "./helper.mjs"

export async function build(ps) {
  await Promise.all(
    ps.map(async pkg => {
      await rm(resolvePath(`${pkg}/dist`), { force: true, recursive: true })
      await execa("tsc", ["--p", resolvePath(`${pkg}/tsconfig.json`)], {
        stdout: process.stdout,
        stderr: process.stderr
      })
    })
  )
}
