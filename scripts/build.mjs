import { green } from "@albumjs/tools/lib/colorette"
import { execa } from "@albumjs/tools/lib/execa"
import minimist from "@albumjs/tools/lib/minimist"
import { gray, yellow } from "colorette"
import { rm } from "fs/promises"
import { resolve } from "path"
import { pkgPreset } from "./config/index.mjs"

const args = minimist(process.argv.slice(2))
let buildPkg = args._
if (buildPkg.length === 0) {
  args.preset = "all"
}
if (args.preset) {
  buildPkg = buildPkg.concat(pkgPreset[args.preset] ?? [])
}

buildPkg.forEach(build)

const cwd = process.cwd()
async function build(pkg) {
  const dist = resolve(cwd, "packages", pkg, "dist")
  const tsconfig = resolve(cwd, "packages", pkg, "tsconfig.json")

  // const { bundler, entries } = pkgBuild[pkg]
  // const src = resolve(cwd, "packages", pkg, "src")
  console.log(yellow(`/* -------------- build:${pkg} -------------- */ `))
  await rm(dist)
  console.log(gray(`clear dist success`))

  await execa("tsc", ["-p", tsconfig, "--emitDeclarationOnly", "true"])
  console.log(green(`build dts success`))

  console.log(green(`build bundle success`))
}
