import type { AlbumServerParams } from "../cli.type.js"
import type { ILogger } from "../../modules/logger/logger.type.js"
import { PluginContextParam } from "../../context/AlbumContext.type.js"

import { NestFactory } from "@nestjs/core"
import { AppModule } from "../../modules/app/app.module.js"
import { Logger } from "../../modules/logger/logger.js"
import { AlbumContext } from "../../context/AlbumContext.js"
import { processClient } from "../../client/processClient.js"
import { processServer } from "../../server/processServer.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { printLogInfo } from "../helper/printLogInfo.js"
import { rmSync } from "fs"
import { resolve } from "path"

export async function albumDevServer(params?: AlbumServerParams) {
  let { app = "default" } = params ?? {}
  let _logger: ILogger
  try {
    rmSync(resolve(".album"), { force: true, recursive: true })
    const [contextErrors, context] = await new AlbumContext(
      app,
      "dev",
      "development"
    ).normalize()
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
      messages: [["dev config:", { app, mode, ssr: status.ssr }, "album"]]
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
      messages: [
        [`listen port: http://localhost:${configs.serverConfig.port}`, "album"]
      ]
    })
  } catch (e: any) {
    ;(_logger ?? new Logger()).error(e, "album")
    throw e
  }
}
