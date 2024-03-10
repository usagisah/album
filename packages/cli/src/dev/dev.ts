import { CAC } from "@albumjs/tools/lib/cac"
import { ExecaChildProcess, execa } from "@albumjs/tools/lib/execa"
import { ParsedArgs } from "@albumjs/tools/lib/minimist"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { SYSTEM_RESTART } from "../constants.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function command(cli: CAC, args: ParsedArgs) {
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
        cProcess = execa("node", [resolve(__dirname, "./dev.server.setup.js"), "--color", JSON.stringify({ appId: appId ?? "default", args })], {
          cwd: process.cwd(),
          stderr: process.stderr
        })
        cProcess.stdout.on("data", (c: Buffer) => {
          if (c.toString().includes(SYSTEM_RESTART)) restart()
          else process.stdout.write(c)
        })
      }
      restart()
    })
}
