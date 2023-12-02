import { NestFactory } from "@nestjs/core"
import { blueBright } from "colorette"
import { processClient } from "../../client/processClient.js"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { AppModule } from "../../modules/app/app.module.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { callPluginWithCatch } from "../../plugins/callPluginWithCatch.js"
import { processServer } from "../../server/processServer.dev.js"
import { DevServerParams } from "../cli.type.js"

export async function albumDevServer(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "dev" })
  try {
    const { logger, info, pluginConfig, serverConfig } = context
    const { plugins, events } = pluginConfig
    const { mode, serverMode, ssr, ssrCompose } = info
    const { port } = serverConfig
    _logger = logger

    await callPluginWithCatch("context", plugins, { messages: new Map(), events, albumContext: context }, logger)
    await processClient(context)
    const serverApp = await NestFactory.create(AppModule, { logger, cors: true })
    await processServer(serverApp, context)

    await serverApp.listen(port)
    logger.log(`dev config: `, { appId, mode, serverMode, ssrCompose, ssr, listen: blueBright(`http://localhost:${port}`) }, "album")
  } catch (e: any) {
    if (_logger !== console) _logger.error(e, "album")
    else _logger.error(e)
    process.exit(1)
  }
}
