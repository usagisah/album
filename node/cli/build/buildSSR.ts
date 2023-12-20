import { RmOptions } from "fs"
import { mkdir, rm } from "fs/promises"
import { build as viteBuild } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { withTransformCjsImporters } from "../../plugins/vite/transformCjsImporters.js"
import { buildCache } from "./buildCache.js"
import { buildCoordinate } from "./buildCoordinate.js"

const rmOptions: RmOptions = { force: true, recursive: true }
export async function buildSSR(context: AlbumContext) {
  const { ssrCompose, outputs, logger } = context
  const { baseOutDir, clientOutDir, ssrOutDir } = outputs
  const clientConfig = (await resolveMiddlewareConfig(context, true)).viteConfigs
  const ssrConfig = (await resolveMiddlewareConfig(context)).viteConfigs

  if (ssrCompose) await Promise.all([rm(clientOutDir, rmOptions), rm(ssrOutDir!, rmOptions)])
  else {
    await rm(baseOutDir, rmOptions)
    await mkdir(baseOutDir, { recursive: true })
  }

  const ssrComposeDependencies = await buildCache(context)

  logger.log("正在打包客户端，请耐心等待...", "album")
  await viteBuild(ssrComposeDependencies ? withTransformCjsImporters(clientConfig, ssrComposeDependencies) : clientConfig)
  logger.log("打包客户端(client)成功", "album")

  const _buildSSR = async () => {
    logger.log("正在打包服务端，请耐心等待...", "album")
    await viteBuild(ssrConfig)
    logger.log("打包服务端(ssr)成功", "album")
  }
  await Promise.all([_buildSSR(), buildCoordinate(context)])
}
