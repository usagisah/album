import { CAC } from "@albumjs/tools/lib/cac"
import { green, red, yellowBright } from "@albumjs/tools/lib/colorette"
import { copy, readJson } from "@albumjs/tools/lib/fs-extra"
import q from "@albumjs/tools/lib/inquirer"
import { ParsedArgs } from "@albumjs/tools/lib/minimist"
import { Obj } from "@albumjs/tools/node"
import { existsSync } from "fs"
import { basename, relative, resolve } from "path"

let manifest: Obj = null
let __dirname: string
export default async function command(cli: CAC, args: ParsedArgs, dirname: string) {
  __dirname = dirname
  manifest = await readJson(resolve(__dirname, "../.create.preset/manifest.json"))
  cli
    .command("create [project] [preset]", "创建一个项目")
    .option("-o, --outDir", "在指定位置创建项目")
    .option("-l, --list", "查看所有预设模版列表")
    .action(async (project: string, preset: string, options: Obj) => {
      if (options.list) {
        return console.log(green(JSON.stringify(Object.keys(manifest), null, 2)))
      }

      const _outDir = await resolveProject(project, options.outDir)
      const _preset = await resolvePreset(preset)
      await copy(_preset, _outDir)
      console.log("\n")
      console.log(green(` 项目创建成功`))
      console.log(green(` 使用模版: ${basename(_preset)}`))
      console.log(green(` 创建路径: ${_outDir}`))
      console.log(green(` cd ${relative(process.cwd(), _outDir)} && pnpm install`))
      console.log("\n")
    })
}

async function resolvePreset(preset: string) {
  if (preset) {
    const res = manifest[preset]
    if (res) {
      return res.entry ?? resolve(__dirname, "../.create.preset", preset)
    }
    console.log(red(`您指定的预设模版(${preset})不存在, 请手动选择已有的预设模版`))
  }

  const presets = Object.keys(manifest)
  return q
    .prompt([
      {
        type: "list",
        name: "preset",
        message: yellowBright("请选择预设模版"),
        choices: presets,
        default: presets[0],
        loop: true
      }
    ])
    .then(r => {
      return resolve(__dirname, "../.create.preset", r.preset)
    })
}

async function resolveProject(project: string, optionOutDir: string) {
  const outDir = optionOutDir ?? resolve(process.cwd(), project ?? "album")
  if (!existsSync(outDir)) {
    return outDir
  }
  console.log(red(`您指定的创建目录(${outDir})已存在, 请更改后尝试创建`))
  process.exit(1)
}
