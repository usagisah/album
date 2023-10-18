import { execa } from "execa"
import { cpFiles } from "./cpFiles.mjs"
import { readFileSync, rmSync, writeFileSync } from "fs"
import { resolve } from "path"

rmSync(resolve("album"), { force: true, recursive: true })
cpFiles(["package.json"], ["node_modules", "types"])

const tsconfigPath = resolve("tsconfig.build.json")
const tsconfigText = readFileSync(tsconfigPath, "utf-8")
const tsconfig = dir => {
  return tsconfigText.replace(
    /"extends": "[^"]*"/,
    `"extends": "./${dir}/tsconfig.json"`
  )
}
try {
  writeFileSync(tsconfigPath, tsconfig("client"), "utf-8")
  await execa("tsc", ["--p", "./tsconfig.build.json"], {
    stdout: process.stdout,
    stderr: process.stderr
  })

  writeFileSync(tsconfigPath, tsconfig("node"), "utf-8")
  await execa("tsc", ["--p", "./tsconfig.build.json"], {
    stdout: process.stdout,
    stderr: process.stderr
  })
} finally {
  writeFileSync(tsconfigPath, tsconfigText, "utf-8")
}
