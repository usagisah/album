import { existsSync, statSync } from "fs"
import { dirname, resolve } from "path"
import { StartServerParams } from "../cli/cli.type.js"
import { Logger } from "../modules/logger/logger.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { createSSRComposeConfig } from "../ssrCompose/start/createSSRComposeConfig.start.js"
import { isPlainObject } from "../utils/check/simple.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { AlbumStartContext } from "./context.type.js"
import { registryEnv } from "./env/start/env.start.js"
import { loadConfig } from "./userConfig/start/loadConfig.start.js"

export async function createAlbumContext({ args }: StartServerParams): Promise<AlbumStartContext> {
  let logger: ILogger = console
  try {
    const cwd = process.cwd()
    let root = args._[0] ?? cwd
    if (root) {
      root = resolve(cwd, root)
      if (!existsSync(root) && !statSync(root).isDirectory()) throw `指定的启动根目录路径不存在(${root})`
    }

    const cacheConfig = await loadConfig(root)
    logger = resolveLogger(cacheConfig.logger)

    let clientInput: string | null = null
    let ssrInput: string | null = null
    let mainSSRInput: string | null = null
    if (cacheConfig.info.ssr && !cacheConfig.info.ssrCompose) {
      mainSSRInput = await resolveFilePath({
        root,
        prefixes: ["ssr", "./"],
        suffixes: ["main.ssr"]
      })
      if (!mainSSRInput) throw "找不到 ssr 的入口文件，请检查目录配置格式是否正确"

      ssrInput = dirname(mainSSRInput)
      clientInput = resolve(ssrInput, "../client")
      if (!existsSync(clientInput)) throw "找不到 client 的入口文件夹，请检查目录格式是否正确"
    }

    const { port, rewrite, appModule, tsconfig } = cacheConfig.serverConfig
    const apiAppInput = appModule.input
    if (apiAppInput && (!existsSync(apiAppInput) || !statSync(apiAppInput).isFile())) throw "指定的 apiAppModule 必须是一个指向文件的路径"
    if (tsconfig && !isPlainObject(tsconfig)) throw "非法格式的 api.tsconfig 格式"

    return {
      info: {
        serverMode: "start",
        mode: ((cacheConfig.info.env.NODE_ENV ?? process.env.NODE_ENV) as any) ?? "production",
        ssr: cacheConfig.info.ssr,
        ssrCompose: cacheConfig.info.ssrCompose,
        env: registryEnv(cacheConfig.info.env),
        inputs: { cwd, root, clientInput, ssrInput, mainSSRInput, apiAppInput }
      },
      logger,
      userConfig: cacheConfig,
      clientConfig: cacheConfig.clientConfig,
      serverConfig: {
        port,
        tsconfig,
        rewrite: rewrite.map(code => new Function("...args", `${code}\nreturn anonymous(...args)`) as any)
      },
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
