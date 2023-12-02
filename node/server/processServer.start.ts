import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { AlbumStartContext } from "../context/context.type.js"
import { expressConfigs } from "../middlewares/express/expressConfigs.js"
import { AlbumContextService } from "../modules/context/album-context.service.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"
import { applySSRComposeStartMiddleware } from "../ssrCompose/start/applySSRComposeMiddleware.start.js"

export async function processServer(serverApp: INestApplication, context: AlbumStartContext) {
  const { info, logger } = context
  const { ssr } = info
  const midConfigs = expressConfigs(context)

  const contextService = serverApp.get(AlbumContextService)
  contextService.getContext = () => context
  await applySSRComposeStartMiddleware(serverApp, context, midConfigs)
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
