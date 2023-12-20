import { createContext } from "../../context/context.start.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"
import { StartServerParams } from "../cli.type.js"

export async function albumStartServer(params: StartServerParams) {
  let _logger: ILogger = console
  try {
    const context = await createContext(params)
    const { serverMode, ssr, ssrCompose, serverManager, logger } = context
    const { port } = serverManager
    _logger = logger

    const serverApp = await processServer(context)
    await serverApp.listen(port)
    logger.log(`start config: `, { serverMode, ssrCompose, ssr, listen: `http://localhost:${port}` }, "album")
  } catch (e: any) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    process.exit(1)
  }
}
