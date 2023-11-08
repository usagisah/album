import { NestFactory } from "@nestjs/core"
import { createAlbumContext } from "../../context/context.start.js"
import { AppModule } from "../../modules/app/app.module.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"

export async function albumStartServer() {
  let _logger: ILogger = console
  try {
    const context = await createAlbumContext()
    const { logger, info, serverConfig } = context
    const { mode, serverMode, ssr, ssrCompose } = info
    const { port } = serverConfig
    _logger = logger

    const serverApp = await NestFactory.create(AppModule, { logger, cors: true })
    await processServer(serverApp, context)

    logger.log(`start config: `, { mode, serverMode, ssrCompose, ssr }, "album")
    await serverApp.listen(port)
    logger.log(`listen port: http://localhost:${port}`, "album")
  } catch (e: any) {
    _logger.error(e, "album")
    throw e
  }
}
