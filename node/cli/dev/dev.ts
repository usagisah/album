import { NestFactory } from "@nestjs/core"
import { processClient } from "../../client/processClient.js"
import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginContextParam } from "../../context/AlbumContext.type.js"
import { AppModule } from "../../modules/app/app.module.js"
import { Logger } from "../../modules/logger/logger.js"
import type { ILogger } from "../../modules/logger/logger.type.js"
import { processServer } from "../../server/processServer.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import type { AlbumServerParams } from "../cli.type.js"
import { printLogInfo } from "../lib/printLogInfo.js"

export async function albumDevServer(params?: AlbumServerParams) {
  let { app = "default" } = params ?? {}
  let _logger: ILogger
  try {
    const [contextErrors, context] = await new AlbumContext(app, "dev", "development").build()
    const { logger, mode, status, configs, plugins } = context
    for (const e of contextErrors) {
      logger.error(e, "AlbumContext", "album")
    }

    await callPluginWithCatch<PluginContextParam>(
      plugins.hooks.context,
      {
        context: new Map(),
        api: plugins.event,
        albumContext: context
      },
      e => logger.error("PluginContext", e, "album")
    )
    await printLogInfo({
      type: "useConfig",
      context,
      messages: [
        [
          "dev config:",
          {
            app,
            mode,
            ssr: status.ssr,
            router: { ...configs.clientConfig.router }
          },
          "album"
        ]
      ]
    })

    _logger = logger
    await processClient(context)
    const serverApp = await NestFactory.create(AppModule, {
      logger,
      cors: mode !== "production"
    })
    await processServer(serverApp, context)
    await serverApp.listen(configs.serverConfig.port)
    await printLogInfo({
      type: "onServerStart",
      context,
      messages: [[`listen port: http://localhost:${configs.serverConfig.port}`, "album"]]
    })
  } catch (e: any) {
    ;(_logger ?? new Logger()).error(e, "album")
    throw e
  }
}
