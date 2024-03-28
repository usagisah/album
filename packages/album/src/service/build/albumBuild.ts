import { processClient } from "../../app/processClient.js"
import { DEFAULT_SYSTEM_RESTART } from "../../constants.js"
import { createContext } from "../../context/context.dev.js"
import { formatSetupInfo } from "../../logger/format.js"
import { ILogger } from "../../logger/logger.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { createSSRComposeManager } from "../../ssrCompose/ssrComposeManager.dev.js"
import { DevServerParams } from "../service.type.js"
import { buildApi } from "./buildApi.js"
import { buildClient } from "./buildClient.js"
import { buildSSR } from "./buildSSR.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger
  try {
    const context = await createContext({ appId, args, serverMode: "build", SYSTEM_RESTART: DEFAULT_SYSTEM_RESTART })
    context.ssrComposeManager = await createSSRComposeManager(context)

    const { ssr, outputs, pluginManager, getStaticInfo, logger } = context
    const { clientOutDir, ssrOutDir } = outputs
    _logger = logger

    await pluginManager.execute("context", { albumContext: context })
    await processClient(context).ready

    const _resolveMiddlewareConfig = (forceClient?: boolean) => {
      return resolveMiddlewareConfig(context, forceClient)
    }
    const { forceQuit } = await pluginManager.execute("buildStart", { forceQuit: false, info: getStaticInfo(), resolveMiddlewareConfig: _resolveMiddlewareConfig })
    if (forceQuit !== true) {
      const buildInfo: [string, string][] = [["clientOutDir", clientOutDir]]
      if (ssr) {
        buildInfo.push(["ssrOutDir", ssrOutDir])
      }

      console.log(formatSetupInfo(appId, context, buildInfo))

      await (ssr ? buildSSR(context) : buildClient(context))
      await buildApi(context)
      await pluginManager.execute("buildEnd", { info: getStaticInfo(), resolveMiddlewareConfig: _resolveMiddlewareConfig })
    }
    logger.log("所有资源打包完毕", "album")
  } catch (e) {
    _logger! ? _logger.error(e, "album") : console.error(e)
    throw e
  }
}
