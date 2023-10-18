import type { AlbumServerParams } from "../cli.type.js"
import type { ILogger } from "../../modules/logger/logger.type.js"
import { callPluginWithCatch, findEntryPath } from "../../utils/utils.js"
import { parse } from "path"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "../../modules/app/app.module.js"
import { Logger } from "../../modules/logger/logger.js"
import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginContextParam } from "../../context/AlbumContext.type.js"
import { processServer } from "../../server/processServer.js"
import { printLogInfo } from "../helper/printLogInfo.js"

export async function albumStartServer(params?: AlbumServerParams) {
  let { app = "default" } = params ?? {}
  let _logger: ILogger
  try {
    const [contextErrors, context] = await new AlbumContext(
      app,
      "start",
      "production"
    ).normalize()
    const { logger, configs, inputs, outputs, plugins } = context
    const { port } = configs.serverConfig
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

    _logger = logger

    inputs.realSSRInput = await findEntryPath({
      cwd: outputs.ssrOutDir,
      name: parse(inputs.ssrInput).name
    })

    const serverApp = await NestFactory.create(AppModule, { logger })
    await processServer(serverApp, context)
    await serverApp.listen(port)
    await printLogInfo({
      type: "onServerStart",
      context,
      messages: [
        [`listen port: http://localhost:${configs.serverConfig.port}`, "album"]
      ]
    })
  } catch (e: any) {
    ;(_logger ?? new Logger()).error(e, "album")
    throw new Error(e, { cause: "album-bootstrap" })
  }
}
