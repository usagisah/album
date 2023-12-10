import { createAlbumContext } from "../../context/context.start.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"
import { StartServerParams } from "../cli.type.js"

export async function albumStartServer(params: StartServerParams) {
  let _logger: ILogger = console
  try {
    const context = await createAlbumContext(params)
    const { logger, info, serverConfig } = context
    const { serverMode, ssr, ssrCompose } = info
    const { port } = serverConfig
    _logger = logger

    const serverApp = await processServer(context)
    await serverApp.listen(port)
    logger.log(`start config: `, { serverMode, ssrCompose, ssr, listen: `http://localhost:${port}` }, "album")
  } catch (e: any) {
    _logger.error(e, "album")
    throw e
  }
}
