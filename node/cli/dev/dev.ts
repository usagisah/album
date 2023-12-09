import { blueBright } from "colorette"
import { processClient } from "../../client/processClient.js"
import { SYSTEM_RESTART } from "../../constants.js"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { callPluginWithCatch } from "../../plugins/callPluginWithCatch.js"
import { processServer } from "../../server/processServer.dev.js"
import { DevServerParams } from "../cli.type.js"
import { rsBuild } from "./rspack.build.js"

export async function albumDevServer(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "dev" })
  try {
    const { logger, info, pluginConfig, serverConfig } = context
    const { plugins, events } = pluginConfig
    const { mode, env, serverMode, inputs, ssr, ssrCompose } = info
    const { port, appModule, tsconfig } = serverConfig
    _logger = logger

    await callPluginWithCatch("context", plugins, { messages: new Map(), events, albumContext: context }, logger)
    await processClient(context)

    const devLogger = () => logger.log(`dev config: `, { appId, mode, serverMode, ssrCompose, ssr, listen: blueBright(`http://localhost:${port}`) }, "album")
    const listenServer = async () => {
      try {
        const res = await processServer(context)
        await res.serverApp.listen(port)
        return res
      } catch (e) {
        logger.error(e, "album")
        return {} as any
      }
    }
    if (appModule.input) {
      let first = true
      rsBuild(
        "watch",
        {
          env,
          filename: appModule.filename,
          input: appModule.input,
          output: appModule.output!,
          tsconfig,
          cwd: inputs.cwd
        },
        async err => {
          if (err) logger.error(err, "album")
          if (first) first = false
          else {
            console.clear()
            logger.log("restart...\n", "album")
            return process.stdout.write(SYSTEM_RESTART)
          }
          await listenServer().then(devLogger)
        }
      )
    } else {
      await listenServer().then(devLogger)
    }
  } catch (e: any) {
    if (_logger !== console) _logger.error(e, "album")
    else _logger.error(e)
    process.exit(1)
  }
}
