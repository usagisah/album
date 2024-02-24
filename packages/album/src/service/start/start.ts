import { Obj } from "@albumjs/tools/node"
import { createContext } from "../../context/context.start.js"
import { ILogger } from "../../logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"
import { StartServerParams } from "../service.type.js"

export async function albumStartServer(params: StartServerParams) {
  let _logger: ILogger = console
  try {
    const context = await createContext(params)
    const { serverMode, ssr, ssrCompose, serverManager, logger } = context
    const { port } = serverManager
    _logger = logger

    const serverApp = await processServer(context)
    await serverApp.listen(port)
    const setupInfo: Obj = { serverMode, listen: `http://localhost:${port}` }
    if (ssr) setupInfo.ssr = true
    if (ssrCompose) setupInfo.ssrCompose = true
    logger.log(`start config: `, setupInfo, "album")
  } catch (e: any) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    process.exit(1)
  }
}
