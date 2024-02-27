import { gray, green, yellow } from "colorette"
import { execa } from "execa"
import { rm } from "fs/promises"
import minimist from "minimist"
import { resolve } from "path"
import { pkgPreset } from "./config/index.mjs"

const cwd = process.cwd()
const args = minimist(process.argv.slice(2))
let buildPkg = args._
if (buildPkg.length === 0) {
  args.preset = "all"
}
if (args.preset) {
  buildPkg = buildPkg.concat(pkgPreset[args.preset] ?? [])
}

buildPkg.reduce((job, pkg) => {
  return job.then(() => build(pkg))
}, Promise.resolve())

async function build(pkg) {
  const dist = resolve(cwd, "packages", pkg, "dist")
  const tsconfig = resolve(cwd, "packages", pkg, "tsconfig.json")

  console.log(yellow(`/* -------------- build:${pkg} -------------- */ `))
  await rm(dist, { force: true, recursive: true })
  console.log(gray(`clear dist success`))

  const tscBuildParams = ["--sourcemap", "false", "--incremental", "false", "--removeComments", "true"]
  await execa("tsc", ["-p", tsconfig, ...tscBuildParams])
  return console.log(green("build dts,bundle success"))
}
