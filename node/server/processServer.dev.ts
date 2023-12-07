import { LazyModuleLoader, ModuleRef, NestFactory } from "@nestjs/core"
import { createServer } from "vite"
import { AlbumDevContext } from "../context/context.type.js"
import { resolveMiddlewareConfig } from "../middlewares/resolveMiddlewareConfig.js"
import { AlbumContextService } from "../modules/context/album-context.service.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { applySSRComposeDevMiddleware } from "../ssrCompose/dev/applySSRComposeMiddleware.dev.js"
import { loadRootModule } from "./loadRootModule.dev.js"

export async function processServer(context: AlbumDevContext) {
  const { info, serverConfig, pluginConfig, logger } = context
  const { ssr, serverMode } = info
  const { midConfigs, viteConfigs } = await resolveMiddlewareConfig(context)
  const { appModule } = serverConfig
  const serverApp = await NestFactory.create(await loadRootModule(appModule), { logger, cors: serverMode !== "start" })

  serverApp.get(AlbumContextService).getContext = () => context

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

  serverApp.use((context.viteDevServer = await createServer(viteConfigs)).middlewares)
  await applySSRComposeDevMiddleware(serverApp, context)

  if (ssr) await serverApp.get(LazyModuleLoader).load(() => SSRModule)
  return serverApp
}
