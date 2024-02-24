import { isPlainObject, resolveFilePath } from "@albumjs/tools/node"
import { parse } from "@ungap/structured-clone/json"
import { existsSync, statSync } from "fs"
import { readFile } from "fs/promises"
import { dirname, resolve, sep } from "path"
import { createAlbumLogger } from "../logger/logger.js"
import { ILogger } from "../logger/logger.type.js"
import { StartServerParams } from "../service/service.type.js"
import { createSSRComposeManager } from "../ssrCompose/ssrComposeManager.start.js"
import { AlbumContext, CacheConfig } from "./context.start.type.js"

export async function createContext({ args }: StartServerParams): Promise<AlbumContext> {
  let logger: ILogger
  try {
    const cwd = process.cwd()
    let root = args._[1]
    if (root) {
      root = `${cwd}${sep}${root}`
      if (!existsSync(root) && !statSync(root).isDirectory()) throw `指定的启动根目录路径不存在(${root})`
    } else {
      root = cwd
    }

    const configPath = await resolveFilePath({ root, prefixes: [""], name: "album.config", exts: ["js"] })
    if (!configPath) throw "找不到生产配置文件"
    const cacheConfig: CacheConfig = parse(await readFile(configPath, "utf-8"))
    if (!isPlainObject(cacheConfig)) throw "似乎找到了个非法的配置文件"

    const { logger: loggerConfig, ssr, ssrCompose, env, appConfig, serverConfig } = cacheConfig
    logger = await createAlbumLogger(loggerConfig!)
    for (const k of Object.getOwnPropertyNames(env)) process.env[k] = env[k]

    let clientInput = ""
    let ssrInput = ""
    let mainSSRInput = ""
    if (ssr && !ssrCompose) {
      mainSSRInput = (await resolveFilePath({ root, prefixes: ["ssr", "./"], suffixes: ["main.ssr"] })) as any
      if (!mainSSRInput) throw "找不到 ssr 的入口文件，请检查目录配置格式是否正确"

      ssrInput = dirname(mainSSRInput)
      clientInput = resolve(ssrInput, "../client")
      if (!existsSync(clientInput)) throw "找不到 client 的入口文件夹，请检查目录格式是否正确"
    } else {
      clientInput = root
    }

    const { port, appModule } = serverConfig
    const apiAppInput = appModule.input
    if (apiAppInput && (!existsSync(apiAppInput) || !statSync(apiAppInput).isFile())) {
      throw "指定的 apiAppModule 必须是一个指向文件的路径"
    }

    return {
      serverMode: "start",
      ssr,
      ssrCompose,
      inputs: { cwd, root, clientInput, ssrInput, mainSSRInput, apiAppInput },
      env,
      logger,
      cacheConfig,
      appManager: appConfig,
      serverManager: { port },
      ssrComposeManager: ssrCompose && (await createSSRComposeManager(root, cacheConfig.ssrComposeConfig))
    }
  } catch (e) {
    logger! ? logger.error(e, "album") : console.error(e)
    process.exit(1)
  }
}
