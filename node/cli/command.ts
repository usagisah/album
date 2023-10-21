import { Logger } from "../modules/logger/logger.js"
import { nodeArgs } from "../utils/utils.js"
import { BuildCommand } from "./build/build.command.js"
import { AlBumServerMode } from "./cli.type.js"
import { DevCommand } from "./dev/dev.command.js"
import { StartCommand } from "./start/start.command.js"

const args = nodeArgs()
const serverMode: AlBumServerMode = args._[0] as any
const app = args._[1] ?? "default"
const logger = new Logger()

switch (serverMode) {
  case "start":
    new StartCommand({ app })
    break
  case "dev":
    new DevCommand({ app })
    break
  case "build":
    new BuildCommand({ app })
    break
  default: {
    logger.error(`启动参数(${serverMode})不合法`, "cli")
    process.exit(1)
  }
}
