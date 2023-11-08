import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { createSSRComposeConfig } from "../ssrCompose/start/createSSRComposeConfig.start.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { AlbumStartContext, AlbumStartStaticInfo } from "./context.type.js"
import { registryEnv } from "./env/start/env.start.js"
import { checkStartConfig } from "./start/checkStartConfig.js"
import { loadConfig } from "./userConfig/start/loadConfig.start.js"

export async function createAlbumContext(): Promise<AlbumStartContext> {
  let logger: ILogger = console
  try {
    const cwd = process.cwd()
    const cacheConfig = await loadConfig()
    logger = resolveLogger(cacheConfig.logger)

    const { root } = await checkStartConfig(cwd, cacheConfig.start)
    let ssrInput: string | null = null
    if (cacheConfig.info.ssr && !cacheConfig.info.ssrCompose) {
      ssrInput = await resolveFilePath({
        root,
        prefixes: ["server", "./", "ssr"],
        suffixes: ["main.ssr"]
      })
      if (!ssrInput) throw "找不到 ssr 的入口文件，请检查目录配置格式是否正确"
    }
    const info: AlbumStartStaticInfo = {
      serverMode: "start",
      mode: "production",
      ssr: cacheConfig.info.ssr,
      ssrCompose: cacheConfig.info.ssrCompose,
      env: registryEnv(cacheConfig.info.env),
      inputs: { cwd, root, ssrInput }
    }
    const ssrComposeConfig = await createSSRComposeConfig(root)

    return {
      info,
      logger,
      userConfig: cacheConfig,
      serverConfig: { port: cacheConfig.serverConfig.port },
      ssrComposeConfig
    }
  } catch (e) {
    logger.error(e, "album")
    throw e
  }
}

function resolveLogger(value: any): ILogger {
  if (!value) return new Logger({})
  if (value.type === "custom") value
  return new Logger(value)
}
