import { stringify } from "@ungap/structured-clone/json"
import { RmOptions } from "fs"
import { mkdir, rm, writeFile } from "fs/promises"
import { resolve, sep } from "path"
import { build as viteBuild } from "vite"
import { processClient } from "../../app/processClient.js"
import { rsModuleRewrite } from "../../builder/rspack/rsModule.js"
import { rsBuild } from "../../builder/rspack/rspack.build.js"
import { createContext } from "../../context/context.dev.js"
import { AlbumContext } from "../../context/context.dev.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { withTransformCjsImporters } from "../../plugins/vite/transformCjsImporters.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.start.type.js"
import { DevServerParams } from "../cli.type.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  try {
    const context = await createContext({ appId, args, serverMode: "build" })
    const { serverMode, ssr, ssrCompose, inputs, outputs, env, appManager, pluginManager, logger } = context
    const { cwd } = inputs
    const { clientOutDir, ssrOutDir } = outputs
    _logger = logger

    await pluginManager.execute("context", { albumContext: context })
    await processClient(context)

    logger.log(
      "build config: ",
      {
        appId,
        mode: env.mode,
        serverMode,
        ssrCompose,
        client: {
          clientInput: resolve(cwd, appManager.mainInput),
          clientOutDir
        },
        ssr: {
          enable: ssr,
          ...(ssr
            ? {
                serverInput: resolve(cwd, appManager.mainSSRInput!),
                ssrOutDir
              }
            : {})
        }
      },
      "album"
    )

    await (ssr ? buildSSR(context) : buildClient(context))
    await buildApi(context)
    await pluginManager.execute("buildEnd", {})

    logger.log("所有资源打包完毕", "album")
    process.exit(0)
  } catch (e) {
    _logger.error(e, "album")
    throw e
  }
}

async function buildCache(context: AlbumContext) {
  const { ssr, ssrCompose, outputs, env, appManager, serverManager, ssrComposeManager, userConfig, logger } = context
  const { ssrRender } = appManager
  const { appModule, port, rewrite } = serverManager

  logger.log("正在创建缓存文件，请耐心等待...", "album")
  let ssrComposeDependencies: SSRComposeDependencies | undefined
  if (ssrComposeManager && ssrComposeManager.dependencies.length > 0) ssrComposeDependencies = await buildSSRComposeDependencies(context)

  const config: CacheConfig = {
    info: { env, ssr, ssrCompose },
    clientConfig: { ssrRender },
    serverConfig: { port, rewrite: rewrite.map(v => v.toString()), appModule: { input: `${outputs.apiOutDir}${sep}${appModule.filename}` } },
    logger: userConfig.logger
  }
  const filename = "album.config.js"
  const output = resolve(outputs.baseOutDir, filename)
  const content = stringify(config)
  await writeFile(output, content, "utf-8")
  if (outputs.baseOutDir !== outputs.outDir) await writeFile(resolve(outputs.outDir, filename), content, "utf-8")

  logger.log("创建完成", "album")
  return ssrComposeDependencies
}

const rmOptions: RmOptions = { force: true, recursive: true }
async function buildClient(context: AlbumContext) {
  const { outputs, logger } = context
  const { clientOutDir } = outputs
  await rm(clientOutDir, rmOptions)

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  logger.log("正在打包客户端...", "album")
  await viteBuild(clientBuildConfig.viteConfigs)
  logger.log("打包客户端成功", "album")

  await buildCache(context)
}

async function buildSSR(context: AlbumContext) {
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

  logger.log("正在打包服务端，请耐心等待...", "album")
  await viteBuild(ssrConfig)
  logger.log("打包服务端(ssr)成功", "album")
}

async function buildApi(context: AlbumContext) {
  const { inputs, outputs, env, serverManager, logger } = context
  const { appModule, tsconfig } = serverManager
  const { filename, input } = appModule
  if (input) {
    logger.log("正在打包服务端(api)，请耐心等待...", "album")
    const error = await rsBuild("build", {
      env,
      filename,
      input,
      output: outputs.apiOutDir!,
      tsconfig,
      cwd: inputs.cwd
    })
    if (error) throw error
    await rsModuleRewrite(`${outputs.apiOutDir}${sep}${filename}`)
    logger.log("打包服务端(api)成功", "album")
  }
}
