import { RmOptions } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { processClient } from "../../client/processClient.js"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { AlbumDevContext } from "../../context/context.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { callPluginWithCatch } from "../../plugins/callPluginWithCatch.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { DevServerParams } from "../cli.type.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"
import { buildStartConfig } from "./buildStartConfig.js"
import { withTransformCjsPlugin } from "./transformSSRComposeImporters.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  try {
    const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "build" })
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
  const { info, logger, ssrComposeConfig } = context
  const { outputs } = info
  const { clientOutDir, ssrOutDir } = outputs
  const clientConfig = (await resolveMiddlewareConfig(context, true)).viteConfigs
  const ssrConfig = (await resolveMiddlewareConfig(context)).viteConfigs

  await Promise.all([rm(clientOutDir, rmOptions), rm(ssrOutDir!, rmOptions)])

  let ssrComposeDependencies: SSRComposeDependencies | undefined
  logger.log("正在创建缓存配置，请耐心等待...", "album")
  if (ssrComposeConfig && ssrComposeConfig.dependencies.length > 0) ssrComposeDependencies = await buildSSRComposeDependencies(context)
  await buildStartConfig(context)
  logger.log("创建完成", "album")

  logger.log("正在打包客户端，请耐心等待...", "album")
  await viteBuild(ssrComposeDependencies ? withTransformCjsPlugin(clientConfig, ssrComposeDependencies) : clientConfig)
  logger.log("打包客户端(client)成功", "album")

  logger.log("正在打包服务端，请耐心等待...", "album")
  await viteBuild(ssrConfig)
  logger.log("打包服务端(ssr)成功", "album")
}
