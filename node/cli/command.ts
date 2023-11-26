import { resolveNodeArgs } from "../utils/command/args.js"
import { BuildCommand } from "./build/build.command.js"
import { ServerMode } from "./cli.type.js"
import { DevCommand } from "./dev/dev.command.js"
import { StartCommand } from "./start/start.command.js"

const args = resolveNodeArgs()
const serverMode: ServerMode = args._[0] as any
const appId = args._[1] ?? "default"

switch (serverMode) {
  case "start":
    new StartCommand()
    break
  case "dev":
    new DevCommand({ appId, args })
    break
  case "build":
    new BuildCommand({ appId, args })
    break
  default: {
    console.error(`启动参数(${serverMode})不合法`, "cli")
    process.exit(1)
  }
}
