import { albumBuild } from "@albumjs/album/service"
import { CAC } from "@albumjs/tools/lib/cac"
import { ParsedArgs } from "@albumjs/tools/lib/minimist"
import { Obj } from "@albumjs/tools/node"
import { resolve } from "path"

export default function command(cli: CAC, args: ParsedArgs) {
  cli
    .command("build [...ids]", "打包应用")
    .option("--cwd [cwd]", "设置默认的，查找根目录路径")
    .example("album build [config.app.id]")
    .action(async (appIds: string[], options) => {
      const { cwd } = options
      if (cwd) {
        process.chdir(resolve(process.cwd(), cwd))
      }

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
      if (Object.keys(errors).length > 0) {
        throw errors
      }
      process.exit(0)
    })
}
