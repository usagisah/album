import { RmOptions } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { processClient } from "../../client/processClient.js"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { AlbumDevContext } from "../../context/context.type.js"
import { callPluginWithCatch } from "../../context/plugins/callPluginWithCatch.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { DevServerParams } from "../cli.type.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"
import { withTransformCjsPlugin } from "./transformSSRComposeImporters.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  try {
    const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "dev" })
    const { logger, info, pluginConfig, clientConfig } = context
    const { plugins, events } = pluginConfig
    const { mode, serverMode, ssr, ssrCompose, inputs, outputs } = info
    const { cwd } = inputs
    const { clientOutDir, ssrOutDir } = outputs
    _logger = logger

    await callPluginWithCatch("context", plugins, { messages: new Map(), events, albumContext: context }, logger)
    await processClient(context)

    logger.log(
      "build config: ",
      {
        appId,
        mode,
        serverMode,
        ssrCompose,
        client: {
          clientInput: resolve(cwd, clientConfig.mainInput),
          clientOutDir
        },
        ssr: {
          enable: ssr,
          ...(ssr
            ? {
                serverInput: resolve(cwd, clientConfig.mainSSRInput!),
                ssrOutDir
              }
            : {})
        }
      },
      "album"
    )

    await (ssr ? buildSSR(context) : buildClient(context))
    await callPluginWithCatch("buildEnd", plugins, { messages: new Map(), events }, logger)

    logger.log("所有资源打包完毕", "album")
  } catch (e) {
    _logger.error(e, "album")
    throw e
  }
}

const rmOptions: RmOptions = { force: true, recursive: true }
async function buildClient(context: AlbumDevContext) {
  const { info, logger } = context
  const { clientOutDir } = info.outputs
  await rm(clientOutDir, rmOptions)

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  logger.log("正在打包客户端...", "album")
  await viteBuild(clientBuildConfig.viteConfigs)
  logger.log("打包客户端成功", "album")
}

async function buildSSR(context: AlbumDevContext) {
  const { info, logger, userConfig } = context
  const { outputs } = info
  const { clientOutDir, ssrOutDir } = outputs
  const ssrBuildConfig = await resolveMiddlewareConfig(context)
  const clientBuildConfig = await resolveMiddlewareConfig(context, true)

  await Promise.all([rm(clientOutDir, rmOptions), rm(ssrOutDir!, rmOptions)])

  if (userConfig?.ssrCompose?.dependencies?.length) {
    logger.log(`发现 ssr-compose 共享依赖，正在生成，请耐心等待...`, "album")
    await buildSSRComposeDependencies(context)
    logger.log(`生成 ssr-compose 共享依赖成功`, "album")
  } else {
    logger.log("ssr-compose 共享依赖为 0, 跳过生成共享依赖")
  }

  logger.log("正在打包客户端，请耐心等待...", "album")
  await viteBuild(withTransformCjsPlugin(clientBuildConfig.viteConfigs, inputs.ssrComposeDependencies))
  logger.log("打包客户端(client)成功", "album")

  logger.log("正在打包服务端，请耐心等待...", "album")
  await viteBuild(ssrBuildConfig.viteConfigs)
  logger.log("打包服务端(ssr/server)成功", "album")
}
