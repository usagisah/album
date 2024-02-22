import { resolve } from "path"
import { processClient } from "../../app/processClient.js"
import { createContext } from "../../context/context.dev.js"
import { ILogger } from "../../logger/logger.type.js"
import { createSSRComposeManager } from "../../ssrCompose/ssrComposeManager.dev.js"
import { DevServerParams } from "../cli.type.js"
import { buildApi } from "./buildApi.js"
import { buildClient } from "./buildClient.js"
import { buildSSR } from "./buildSSR.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger
  try {
    const context = await createContext({ appId, args, serverMode: "build" })
    context.ssrComposeManager = await createSSRComposeManager(context)

    const { serverMode, ssr, ssrCompose, inputs, outputs, env, appManager, pluginManager, logger } = context
    const { cwd } = inputs
    const { clientOutDir, ssrOutDir } = outputs
    _logger = logger

    await pluginManager.execute("context", { albumContext: context })
    await processClient(context)

    logger.log(
      "build config: ",
      {
        appId,
        mode: env.mode,
        serverMode,
        ssrCompose,
        client: {
          clientInput: resolve(cwd, appManager.mainInput),
          clientOutDir
        },
        ssr: {
          enable: ssr,
          ...(ssr
            ? {
                serverInput: resolve(cwd, appManager.mainSSRInput!),
                ssrOutDir
              }
            : {})
        }
      },
      "album"
    )

    await (ssr ? buildSSR(context) : buildClient(context))
    await buildApi(context)
    await pluginManager.execute("buildEnd", {})

    logger.log("所有资源打包完毕", "album")
  } catch (e) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    throw e
  }
}
