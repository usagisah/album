import { Obj, resolveNodeArgs } from "@albumjs/tools/node"
import { cac } from "cac"
import { ExecaChildProcess, execa } from "execa"
import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { Writable } from "stream"
import { fileURLToPath } from "url"
import { SYSTEM_RESTART } from "../constants.js"
import { albumBuild } from "./build/albumBuild.js"
import { albumStartServer } from "./start/start.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"))
const args = resolveNodeArgs()
const cli = cac("album")
cli
  .command("dev [id]", "启动开发服务器")
  .option("--cwd [cwd]", "设置默认的，查找根目录路径")
  .example("album dev [config.app.id]")
  .action(async (appId, options) => {
    const { cwd } = options
    if (cwd) {
      process.chdir(resolve(process.cwd(), cwd))
    }

    let cProcess: ExecaChildProcess | null = null
    const restart = () => {
      if (cProcess) {
        cProcess.kill()
        cProcess = null
      }
      cProcess = execa("node", [resolve(__dirname, "./dev/dev.placeholder.js"), "--color", JSON.stringify({ appId: appId ?? "default", args })], {
        cwd: process.cwd(),
        stderr: process.stderr
      })
      cProcess.stdout!.pipe(
        new Writable({
          write(c, _, cb) {
            if (c.toString().includes(SYSTEM_RESTART)) restart()
            else process.stdout.write(c)
            cb()
          }
        })
      )
    }
    restart()
  })

cli
  .command("build [...ids]", "打包应用")
  .example("album build [config.app.id]")
  .action(async (appIds: string[]) => {
    if (appIds.length === 0) {
      await albumBuild({ appId: "default", args })
      process.exit(0)
    }

    const errors: Obj = {}
    for (const appId of appIds) {
      await albumBuild({ appId, args })
        .catch(() => null)
        .catch(e => {
          errors[appId] = errors
        })
    }
    if (errors.length > 0) {
      throw errors
    }
    process.exit(0)
  })

cli
  .command("start [root]", "启动生产服务器")
  .example("album start")
  .action(() => {
    albumStartServer({ args })
  })

try {
  cli.help().version(version).parse()
} catch (e) {
  console.error(`启动参数(${JSON.stringify(args)})不合法`, "cli")
  process.exit(1)
}
