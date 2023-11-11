import { existsSync } from "fs"
import { dirname, resolve } from "path"
import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { createSSRComposeConfig } from "../ssrCompose/start/createSSRComposeConfig.start.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { AlbumStartContext } from "./context.type.js"
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
    let clientInput: string | null = null
    let ssrInput: string | null = null
    let mainSSRInput: string | null = null
    if (cacheConfig.info.ssr && !cacheConfig.info.ssrCompose) {
      mainSSRInput = await resolveFilePath({
        root,
        prefixes: ["server", "./", "ssr"],
        suffixes: ["main.ssr"]
      })
      if (!mainSSRInput) throw "找不到 ssr 的入口文件，请检查目录配置格式是否正确"

      ssrInput = dirname(mainSSRInput)
      clientInput = resolve(ssrInput, "../client")
      if (!existsSync(clientInput)) throw "找不到 client 的入口文件夹，请检查目录格式是否正确"
    }

    return {
      info: {
        serverMode: "start",
        mode: "production",
        ssr: cacheConfig.info.ssr,
        ssrCompose: cacheConfig.info.ssrCompose,
        env: registryEnv(cacheConfig.info.env),
        inputs: { cwd, root, clientInput, ssrInput, mainSSRInput }
      },
      logger,
      userConfig: cacheConfig,
      serverConfig: { port: cacheConfig.serverConfig.port },
      ssrComposeConfig: await createSSRComposeConfig(root)
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
