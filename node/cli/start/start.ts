import { NestFactory } from "@nestjs/core"
import { createAlbumContext } from "../../context/context.start.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { processServer } from "../../server/processServer.start.js"

export async function albumStartServer() {
  // let _logger: ILogger = console
  // try {
  //   const context = await createAlbumContext()
  //   const { logger, info, serverConfig } = context
  //   const { mode, serverMode, ssr, ssrCompose } = info
  //   const { port } = serverConfig
  //   _logger = logger

  //   const serverApp = await NestFactory.create(AppModule, { logger })
  //   await processServer(serverApp, context)
  //   await serverApp.listen(port)
  //   logger.log(`start config: `, { mode, serverMode, ssrCompose, ssr, listen: `http://localhost:${port}` }, "album")
  // } catch (e: any) {
  //   _logger.error(e, "album")
  //   throw e
  // }
}
