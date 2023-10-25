import type { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { createServer } from "vite"
import type { AlbumContext } from "../context/AlbumContext.js"
import { PluginServerParam } from "../context/AlbumContext.type.js"
import { resolveMiddlewareConfig } from "../middlewares/resolveMiddlewareConfig.js"
import { AlbumContextService } from "../modules/context/album-context.service.js"
import { SsrModule } from "../modules/ssr/ssr.module.js"
import { callPluginWithCatch } from "../utils/utils.js"
import { ssrComposeMiddleware } from "./ssrCompose/ssrComposeMiddleware.js"

export async function processServer(app: INestApplication<any>, context: AlbumContext) {
  const { mode, status, vite, plugins, logger, configs } = context
  const { midConfigs, viteConfigs } = await resolveMiddlewareConfig(context)

  const contextService = app.get(AlbumContextService)
  contextService.setContext(context)

  await callPluginWithCatch<PluginServerParam>(
    plugins.hooks.server,
    {
      context: new Map(),
      api: plugins.event,
      mode,
      status,
      app
    },
    e => logger.error("PluginServer", e, "album")
  )

  if (mode !== "production") {
    const s = (vite.viteDevServer = await createServer(viteConfigs))
    app.use(s.middlewares)
  }

  await ssrComposeMiddleware(app, midConfigs, context)

  for (const [name, { config, factory }] of [...midConfigs.entries()]) {
    try {
      const mid = await factory.apply(globalThis, config)
      app.use(mid)
    } catch (e) {
      logger.error(`注册服务器中间件发现错误 --${name}\nerror:`, e, "album")
    }
  }

  if (status.ssr) {
    const nestModuleLoader = app.get(LazyModuleLoader)
    await nestModuleLoader.load(() => SsrModule)
  }

  return app
}
