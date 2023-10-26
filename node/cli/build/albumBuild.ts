import { rm } from "fs/promises"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { processClient } from "../../client/processClient.js"
import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginContextParam } from "../../context/AlbumContext.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import type { AlbumServerParams } from "../cli.type.js"
import { printLogInfo } from "../lib/printLogInfo.js"

export async function albumBuild(params?: AlbumServerParams) {
  const { app = "default" } = params ?? {}
  const [contextErrors, context] = await new AlbumContext(app, "build", "production").normalize()
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
  await printLogInfo({
    type: "onBuildEnd",
    context,
    messages: [["build success", "album"]]
  })
}

async function buildClient(context: AlbumContext) {
  const {
    outputs: { clientOutDir },
    logger
  } = context
  await rm(clientOutDir, { force: true, recursive: true })

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  await viteBuild(clientBuildConfig.viteConfigs).catch(e => {
    logger.error("打包客户端过程发现错误:", e, "album")
    throw e
  })
}

async function buildSSR(context: AlbumContext) {
  const { clientOutDir, ssrOutDir } = context.outputs
  const ssrBuildConfig = await resolveMiddlewareConfig(context)
  const clientBuildConfig = await resolveMiddlewareConfig(context, true)

  await Promise.all([rm(clientOutDir, { force: true, recursive: true }), rm(ssrOutDir, { force: true, recursive: true })])
  await viteBuild(clientBuildConfig.viteConfigs)
  console.log("\n\n")
  await viteBuild(ssrBuildConfig.viteConfigs)
}
