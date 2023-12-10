import { stringify } from "@ungap/structured-clone/json"
import { RmOptions } from "fs"
import { mkdir, rm, writeFile } from "fs/promises"
import { resolve, sep } from "path"
import { build as viteBuild } from "vite"
import { rsModuleRewrite } from "../../builder/rspack/rsModule.js"
import { rsBuild } from "../../builder/rspack/rspack.build.js"
import { processClient } from "../../client/processClient.js"
import { createAlbumDevContext } from "../../context/context.dev.js"
import { AlbumDevContext, StartCacheUserConfig } from "../../context/context.type.js"
import { resolveMiddlewareConfig } from "../../middlewares/resolveMiddlewareConfig.js"
import { ILogger } from "../../modules/logger/logger.type.js"
import { callPluginWithCatch } from "../../plugins/callPluginWithCatch.js"
import { withTransformCjsImporters } from "../../plugins/vite/transformCjsImporters.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { DevServerParams } from "../cli.type.js"
import { buildSSRComposeDependencies } from "./buildSSRComposeDependencies.js"

export async function albumBuild(params: DevServerParams) {
  let { appId = "default", args } = params
  let _logger: ILogger = console
  try {
    const context = await createAlbumDevContext({ appId, args, mode: "development", serverMode: "build" })
    const { logger, info, pluginConfig, clientConfig } = context
    const { plugins, events } = pluginConfig
    const { mode, serverMode, ssr, ssrCompose, inputs, outputs } = info
    const { cwd } = inputs
    const { clientOutDir, ssrOutDir } = outputs
    _logger = logger

    await callPluginWithCatch("context", plugins, { messages: new Map(), events, albumContext: context }, logger)
    await processClient(context)

    logger.log(
      "build config: ",
      {
        appId,
        mode,
        serverMode,
        ssrCompose,
        client: {
          clientInput: resolve(cwd, clientConfig.mainInput),
          clientOutDir
        },
        ssr: {
          enable: ssr,
          ...(ssr
            ? {
                serverInput: resolve(cwd, clientConfig.mainSSRInput!),
                ssrOutDir
              }
            : {})
        }
      },
      "album"
    )

    await (ssr ? buildSSR(context) : buildClient(context))
    await buildApi(context)
    await callPluginWithCatch("buildEnd", plugins, { messages: new Map(), events }, logger)

    logger.log("所有资源打包完毕", "album")
    process.exit(0)
  } catch (e) {
    _logger.error(e, "album")
    throw e
  }
}

async function buildCache(context: AlbumDevContext) {
  const { info, ssrComposeConfig, clientConfig, serverConfig, userConfig, logger } = context
  const { ssrRender } = clientConfig
  const { env, ssr, ssrCompose, outputs } = info
  const { appModule, port, rewrite } = serverConfig

  logger.log("正在创建缓存文件，请耐心等待...", "album")
  let ssrComposeDependencies: SSRComposeDependencies | undefined
  if (ssrComposeConfig && ssrComposeConfig.dependencies.length > 0) ssrComposeDependencies = await buildSSRComposeDependencies(context)

  const config: StartCacheUserConfig = {
    info: { env, ssr, ssrCompose },
    clientConfig: { ssrRender },
    serverConfig: { port, rewrite: rewrite.map(v => v.toString()), appModule: { input: `${outputs.apiOutDir}${sep}${appModule.filename}` } },
    logger: userConfig.logger
  }
  const output = resolve(context.info.outputs.outBase, "album.config.js")
  await writeFile(output, stringify(config), "utf-8")

  logger.log("创建完成", "album")
  return ssrComposeDependencies
}

const rmOptions: RmOptions = { force: true, recursive: true }
async function buildClient(context: AlbumDevContext) {
  const { info, logger } = context
  const { clientOutDir } = info.outputs
  await rm(clientOutDir, rmOptions)

  const clientBuildConfig = await resolveMiddlewareConfig(context)
  logger.log("正在打包客户端...", "album")
  await viteBuild(clientBuildConfig.viteConfigs)
  logger.log("打包客户端成功", "album")

  await buildCache(context)
}

async function buildSSR(context: AlbumDevContext) {
  const { info, logger } = context
  const { ssrCompose, outputs } = info
  const { outBase, clientOutDir, ssrOutDir } = outputs
  const clientConfig = (await resolveMiddlewareConfig(context, true)).viteConfigs
  const ssrConfig = (await resolveMiddlewareConfig(context)).viteConfigs

  if (ssrCompose) await Promise.all([rm(clientOutDir, rmOptions), rm(ssrOutDir!, rmOptions)])
  else {
    await rm(outBase, rmOptions)
    await mkdir(outBase, { recursive: true })
  }

  const ssrComposeDependencies = await buildCache(context)

  logger.log("正在打包客户端，请耐心等待...", "album")
  await viteBuild(ssrComposeDependencies ? withTransformCjsImporters(clientConfig, ssrComposeDependencies) : clientConfig)
  logger.log("打包客户端(client)成功", "album")

  logger.log("正在打包服务端，请耐心等待...", "album")
  await viteBuild(ssrConfig)
  logger.log("打包服务端(ssr)成功", "album")
}

async function buildApi(context: AlbumDevContext) {
  const { info, serverConfig, logger } = context
  const { env, inputs, outputs } = info
  const { appModule, tsconfig } = serverConfig
  const { filename, input } = appModule
  if (input) {
    logger.log("正在打包服务端(api)，请耐心等待...", "album")
    const error = await rsBuild("build", {
      env,
      filename,
      input,
      output: outputs.apiOutDir,
      tsconfig,
      cwd: inputs.cwd
    })
    if (error) throw error
    await rsModuleRewrite(`${outputs.apiOutDir}${sep}${filename}`)
    logger.log("打包服务端(api)成功", "album")
  }
}
