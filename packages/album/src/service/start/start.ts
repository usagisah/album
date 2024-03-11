import { createContext } from "../../context/context.start.js"
import { formatSetupInfo } from "../../logger/format.js"
import { ILogger } from "../../logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"
import { StartServerParams } from "../service.type.js"

export async function albumStartServer(params: StartServerParams) {
  let _logger: ILogger = console
  try {
    const context = await createContext(params)
    const { serverManager, logger } = context
    const { port } = serverManager
    _logger = logger

    const serverApp = await processServer(context)
    await serverApp.listen(port)
    console.log(formatSetupInfo("", context))
  } catch (e: any) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    process.exit(1)
  }
}
