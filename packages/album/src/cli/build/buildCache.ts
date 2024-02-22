import { stringify } from "@ungap/structured-clone/json"
import { writeFile } from "fs/promises"
import { sep } from "path"
import { AlbumContext } from "../../context/context.dev.type.js"
import { CacheConfig } from "../../context/context.start.type.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"

export async function buildCache(context: AlbumContext) {
  const { ssr, ssrCompose, outputs, env, appManager, serverManager, ssrComposeManager, userConfig, logger } = context
  const { ssrRender } = appManager
  const { appModule, port } = serverManager

  logger.log("正在创建缓存文件，请耐心等待...", "album")
  const ssrComposeDependencies = ssrComposeManager && (await buildSSRComposeDependencies(context))
  const config: CacheConfig = {
    ssr,
    ssrCompose,
    env,
    appConfig: { ssrRender },
    serverConfig: {
      port,
      appModule: { input: appModule.input ? `${outputs.apiOutDir}${sep}${appModule.filename}` : null }
    },
    ssrComposeConfig: {
      rewrites: ssrComposeManager ? ssrComposeManager.rewrites.encode.map(f => f.toString()) : []
    },
    logger: userConfig.logger ?? null
  }
  const filename = "album.config.js"
  const output = `${outputs.baseOutDir}${sep}${filename}`
  const content = stringify(config)
  await writeFile(output, content, "utf-8")
  if (outputs.baseOutDir !== outputs.outDir) await writeFile(`${outputs.outDir}${sep}${filename}`, content, "utf-8")

  logger.log("创建完成", "album")
  return ssrComposeDependencies
}
