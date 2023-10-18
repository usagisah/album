import { execa } from "execa"
import { cpFiles } from "./cpFiles.mjs"
import { rmSync } from "fs"
import { resolve } from "path"

rmSync(resolve("album"), { force: true, recursive: true })
cpFiles(["package.json"], ["node_modules", "types"])
await execa("tsc", ["--p", "./client/tsconfig.json"], {
  stdout: process.stdout,
  stderr: process.stderr
})
await execa("tsc", ["--p", "./node/tsconfig.json", "-w"], {
  stdout: process.stdout,
  stderr: process.stderr
})
