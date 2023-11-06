import { NestFactory } from "@nestjs/core"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { callPluginWithCatch } from "../../context/plugins/callPluginWithCatch.js"
import { AppModule } from "../../modules/app/app.module.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { DevServerParams } from "../cli.type.js"
import { processClient } from "../../client/processClient.js"
import { processDevServer } from "../../server/processServer.dev.js"

export async function albumDevServer(params: DevServerParams) {
  let { appId = "default", args } = params ?? {}
  let _logger: ILogger = console
  try {
    const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "dev" })
    const { logger, info, pluginConfig, serverConfig } = context
    const { plugins, events } = pluginConfig
    const { mode, serverMode, ssr, ssrCompose } = info
    const { port } = serverConfig
    _logger = logger

    await callPluginWithCatch("context", plugins, { messages: new Map(), events, albumContext: context }, logger)
    await processClient(context)
    const serverApp = await NestFactory.create(AppModule, { logger, cors: true })
    await processDevServer(serverApp, context)

    logger.log(`dev config: `, { appId, mode, serverMode, ssr, ssrCompose }, "album")
    await serverApp.listen(port)
    logger.log(`listen port: http://localhost:${port}`, "album")
  } catch (e: any) {
    _logger.error(e, "album")
    throw e
  }
}
