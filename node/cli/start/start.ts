import { NestFactory } from "@nestjs/core"
import { createAlbumContext } from "../../context/context.start.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { loadRootModule } from "../../server/loadRootModule.dev.js"
import { processServer } from "../../server/processServer.start.js"
import { StartServerParams } from "../cli.type.js"

export async function albumStartServer(params: StartServerParams) {
  let _logger: ILogger = console
  try {
    const context = await createAlbumContext(params)
    const { logger, info, serverConfig } = context
    const { mode, serverMode, ssr, ssrCompose, inputs } = info
    const { apiAppInput } = inputs
    const { port } = serverConfig
    _logger = logger

    const serverApp = await NestFactory.create(await loadRootModule(apiAppInput), { logger })
    await processServer(serverApp, context)
    await serverApp.listen(port)
    logger.log(`start config: `, { mode, serverMode, ssrCompose, ssr, listen: `http://localhost:${port}` }, "album")
  } catch (e: any) {
    _logger.error(e, "album")
    throw e
  }
}
