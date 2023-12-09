import { LazyModuleLoader, NestFactory } from "@nestjs/core"
import { resolve } from "path"
import { createServer } from "vite"
import { AlbumDevContext } from "../context/context.type.js"
import { resolveMiddlewareConfig } from "../middlewares/resolveMiddlewareConfig.js"
import { AlbumContextModule } from "../modules/context/album-context.module.js"
import { LoggerModule } from "../modules/logger/logger.module.js"
import { SpaModule } from "../modules/spa/spa.module.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { applySSRComposeDevMiddleware } from "../ssrCompose/dev/applySSRComposeMiddleware.dev.js"
import { loadRootModule } from "./loadRootModule.dev.js"

export async function processServer(context: AlbumDevContext) {
  const { info, serverConfig, pluginConfig, logger } = context
  const { ssr, serverMode } = info
  const { midConfigs, viteConfigs } = await resolveMiddlewareConfig(context)

  const m = serverConfig.appModule
  const apiAppModuleInput = m.input ? resolve(m.output!, m.filename) : null
  const serverApp = await NestFactory.create(await loadRootModule(apiAppModuleInput), {
    logger,
    cors: serverMode !== "start"
  })
  const moduleLoader = serverApp.get(LazyModuleLoader)
  await Promise.all([moduleLoader.load(() => LoggerModule.forRoot(logger)), moduleLoader.load(() => AlbumContextModule.forRoot(context))])

  const { plugins, events } = pluginConfig
  await callPluginWithCatch("server", plugins, { messages: new Map(), events, info, app: serverApp }, logger)

  for (const { enable, name, config, factory } of midConfigs) {
    if (!enable) continue
    try {
      serverApp.use(await factory.apply(globalThis, config))
    } catch (e) {
      logger.error(`注册服务器中间件发现错误 --${name}\nerror:`, e, "album")
    }
  }

  const viteDevServer = await createServer(viteConfigs)
  serverApp.use((context.viteDevServer = viteDevServer).middlewares)
  await applySSRComposeDevMiddleware(serverApp, context)

  if (ssr) await moduleLoader.load(() => SSRModule)
  else await moduleLoader.load(() => SpaModule)
  return { serverApp, viteDevServer }
}
