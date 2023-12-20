import { RmOptions } from "fs"
import { rm } from "fs/promises"
import { build as viteBuild } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { buildCache } from "./buildCache.js"

const rmOptions: RmOptions = { force: true, recursive: true }
export async function buildClient(context: AlbumContext) {
  const { outputs, logger } = context
  const { clientOutDir } = outputs
  await rm(clientOutDir, rmOptions)

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  logger.log("正在打包客户端...", "album")
  await viteBuild(clientBuildConfig.viteConfigs)
  logger.log("打包客户端成功", "album")

  await buildCache(context)
}
