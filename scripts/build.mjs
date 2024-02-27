import { gray, green, yellow } from "colorette"
import { execa } from "execa"
import { rm } from "fs/promises"
import minimist from "minimist"
import { resolve } from "path"
import { pkgBuild, pkgPreset } from "./config/index.mjs"

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

  const { bundler, entries } = pkgBuild[pkg]
  const tscBuildParams = ["--sourcemap", "false", "--incremental", "false", "--removeComments", "true"]
  if (bundler === "tsc") {
    await execa("tsc", ["-p", tsconfig, ...tscBuildParams])
    return console.log(green("build dts,bundle success"))
  }

  await execa("tsc", ["-p", tsconfig, "--emitDeclarationOnly", "true", ...tscBuildParams])
  console.log(green(`build dts success`))

  const { readJson } = await import("@albumjs/tools/lib/fs-extra")
  const packageJson = await readJson(resolve(cwd, "packages", pkg, "package.json"))
  const esbuildNodeOptions = {
    entryPoints: entries.map(item => resolve(cwd, "packages", pkg, "src", item.name + ".ts")),
    platform: "node",
    format: "esm",
    bundle: true,
    tsconfig,
    minify: false,
    outdir: dist,
    external: [...Object.keys(packageJson.dependencies)]
  }
  if (bundler === "esbuild") {
    const { build } = await import("@albumjs/tools/lib/esbuild")
    await build(esbuildNodeOptions)
  }
  if (bundler === "esbuild:decorator") {
    const { esbuildWithDecorator } = await import("@albumjs/tools/bundle/index")
    await esbuildWithDecorator(esbuildNodeOptions)
  }
  console.log(green(`build bundle success`))
}
