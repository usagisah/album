import { albumStartServer } from "@albumjs/album/service"
import { CAC } from "@albumjs/tools/lib/cac"
import { ParsedArgs } from "@albumjs/tools/lib/minimist"

export default function command(cli: CAC, args: ParsedArgs) {
  cli
    .command("start [root]", "启动生产服务器")
    .example("album start")
    .action(() => {
      albumStartServer({ args })
    })
}
