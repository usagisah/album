import { processClient } from "../../app/processClient.js"
import { rsBuild } from "../../builder/rspack/rspack.build.js"
import { DEFAULT_SYSTEM_RESTART } from "../../constants.js"
import { createContext } from "../../context/context.dev.js"
import { formatSetupInfo } from "../../logger/format.js"
import { ILogger } from "../../logger/logger.type.js"
import { processServer } from "../../server/processServer.dev.js"
import { createSSRComposeManager } from "../../ssrCompose/ssrComposeManager.dev.js"
import { DevServerParams } from "../service.type.js"

export async function albumDevServer(params: DevServerParams) {
  const markStart = performance.now()
  let { appId = "default", args, SYSTEM_RESTART = DEFAULT_SYSTEM_RESTART, config } = params
  let _logger: ILogger = console

  const context = await createContext({ appId, args, serverMode: "dev", SYSTEM_RESTART, config })
  try {
    const { inputs, env, serverManager, pluginManager, logger } = context
    context.ssrComposeManager = await createSSRComposeManager(context)

    _logger = logger
    const { port, appModule, tsconfig } = serverManager

    await pluginManager.execute("context", { albumContext: context })
    context.clientManager = processClient(context)

    const devLogger = () => {
      console.log(formatSetupInfo(appId, context, [["takes", ((performance.now() - markStart) / 1000).toFixed(2) + "s"]]))
    }
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
            return process.stderr.write(SYSTEM_RESTART)
          }
          await listenServer().then(devLogger)
        }
      )
    } else {
      await listenServer().then(devLogger)
    }
  } catch (e: any) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    process.exit(1)
  }
}
