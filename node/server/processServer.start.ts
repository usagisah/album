import { LazyModuleLoader, NestFactory } from "@nestjs/core"
import { loadRsModule } from "../builder/rspack/rsModule.js"
import { AlbumStartContext } from "../context/context.type.js"
import { expressConfigs } from "../middlewares/express/expressConfigs.js"
import { AlbumContextModule } from "../modules/context/album-context.module.js"
import { LoggerModule } from "../modules/logger/logger.module.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"
import { applySSRComposeStartMiddleware } from "../ssrCompose/applySSRComposeMiddleware.start.js"

export async function processServer(context: AlbumStartContext) {
  const { info, logger } = context
  const { ssr, inputs } = info
  const { apiAppInput } = inputs
  const midConfigs = expressConfigs(context)

  const serverApp = await NestFactory.create(await loadRsModule(apiAppInput, false), { logger })
  const moduleLoader = serverApp.get(LazyModuleLoader)
  await Promise.all([moduleLoader.load(() => LoggerModule.forRoot(logger)), moduleLoader.load(() => AlbumContextModule.forRoot(context))])
  await applySSRComposeStartMiddleware(serverApp, context, midConfigs)
  for (const { enable, name, config, factory } of midConfigs) {
    if (!enable) continue
    try {
      serverApp.use(await factory.apply(globalThis, config))
    } catch (e) {
      logger.error(`注册服务器中间件发现错误 --${name}\nerror:`, e, "album")
    }
  }
  if (ssr) await moduleLoader.load(() => SSRModule)
  return serverApp
}
