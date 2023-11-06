import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { applySSRComposeDevMiddleware } from "ssrCompose/dev/applySSRComposeMiddleware.dev.js"
import { applySSRComposeStartMiddleware } from "ssrCompose/start/applySSRComposeMiddleware.start.js"
import { createServer } from "vite"
import { AlbumDevContext } from "../context/context.type.js"
import { callPluginWithCatch } from "../context/plugins/callPluginWithCatch.js"
import { resolveMiddlewareConfig } from "../middlewares/resolveMiddlewareConfig.js"
import { AlbumContextService } from "../modules/context/album-context.service.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"

export async function processDevServer(serverApp: INestApplication, context: AlbumDevContext) {
  const { info, pluginConfig, logger } = context
  const { mode, serverMode, ssr } = info
  const { midConfigs, viteConfigs } = await resolveMiddlewareConfig(context)

  const contextService = serverApp.get(AlbumContextService)
  contextService.setContext(context)

  const { plugins, events } = pluginConfig
  await callPluginWithCatch("server", plugins, { messages: new Map(), events, info, app: serverApp }, logger)

  if (mode !== "production") serverApp.use((context.viteDevServer = await createServer(viteConfigs)).middlewares)
  serverMode === "start" ? await applySSRComposeStartMiddleware() : await applySSRComposeDevMiddleware(serverApp, context)

  for (const { enable, name, config, factory } of midConfigs) {
    if (!enable) continue
    try {
      serverApp.use(await factory.apply(globalThis, config))
    } catch (e) {
      logger.error(`注册服务器中间件发现错误 --${name}\nerror:`, e, "album")
    }
  }

  if (ssr) await serverApp.get(LazyModuleLoader).load(() => SSRModule)
}
