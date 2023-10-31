import type { AlbumServerParams } from "../cli.type.js"

import { rm } from "fs/promises"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { processClient } from "../../client/processClient.js"
import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginBuildEndParam, PluginContextParam } from "../../context/AlbumContext.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { printLogInfo } from "../lib/printLogInfo.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"
import { withTransformCjsPlugin } from "./transformSSRComposeImporters.js"

export async function albumBuild(params?: AlbumServerParams) {
  const { app = "default" } = params ?? {}
  const [contextErrors, context] = await new AlbumContext(app, "build", "production").build()
  const {
    mode,
    status: { ssr },
    configs: { clientConfig },
    logger,
    plugins,
    outputs: { clientOutDir, ssrOutDir }
  } = context
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
  await processClient(context)
  await printLogInfo({
    type: "onBuildStart",
    context,
    messages: [
      [
        "build config:",
        {
          app,
          mode,
          ssr: {
            enable: ssr,
            ...(ssr
              ? {
                  serverInput: resolve(clientConfig.mainSSR),
                  ssrOutDir
                }
              : {})
          },
          client: {
            clientInput: resolve(clientConfig.main),
            clientOutDir
          }
        },
        "album"
      ]
    ]
  })
  await (ssr ? buildSSR(context) : buildClient(context))
  await callPluginWithCatch<PluginBuildEndParam>(
    plugins.hooks.buildEnd,
    {
      context: new Map(),
      api: plugins.event
    },
    e => logger.error("PluginBuildEnd", e, "album")
  )
  await printLogInfo({
    type: "onBuildEnd",
    context,
    messages: [["所有资源打包完毕", "album"]]
  })
}

async function buildClient(context: AlbumContext) {
  const {
    outputs: { clientOutDir },
    logger
  } = context
  await rm(clientOutDir, { force: true, recursive: true })

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  logger.log("正在打包客户端...", "album")
  await viteBuild(clientBuildConfig.viteConfigs).catch(e => {
    logger.error("打包客户端过程发现错误:", e, "album")
    throw e
  })
  logger.log("打包客户端成功", "album")
}

async function buildSSR(context: AlbumContext) {
  const { logger, configs, inputs, outputs } = context
  const { clientOutDir, ssrOutDir } = outputs
  const ssrBuildConfig = await resolveMiddlewareConfig(context)
  const clientBuildConfig = await resolveMiddlewareConfig(context, true)

  await Promise.all([rm(clientOutDir, { force: true, recursive: true }), rm(ssrOutDir, { force: true, recursive: true })])

  if (configs.userConfig?.ssrCompose?.dependencies?.length) {
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
