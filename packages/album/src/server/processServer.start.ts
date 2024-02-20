import { LazyModuleLoader, NestFactory } from "@nestjs/core"
import { loadRsModule } from "../builder/rspack/rsModule.js"
import { AlbumContext } from "../context/context.start.type.js"
import { expressConfigs } from "../middlewares/express/expressConfigs.js"
import { AlbumContextModule } from "../modules/context/album-context.module.js"
import { LoggerModule } from "../modules/logger/logger.module.js"
import { SpaModule } from "../modules/spa/spa.module.js"
import { SSRModule } from "../modules/ssr/ssr.module.js"
import { applySSRComposeStartMiddleware } from "../ssrCompose/applySSRComposeMiddleware.start.js"

export async function processServer(context: AlbumContext) {
  const { ssr, ssrCompose, inputs, logger } = context
  const { apiAppInput } = inputs
  const midConfigs = expressConfigs(context)
  const serverApp = await NestFactory.create(await loadRsModule(apiAppInput, false), { logger })
  const moduleLoader = serverApp.get(LazyModuleLoader)
  await Promise.all([moduleLoader.load(() => LoggerModule.forRoot(logger)), moduleLoader.load(() => AlbumContextModule.forRoot(context))])
  if (ssrCompose) await applySSRComposeStartMiddleware(serverApp, context, midConfigs)
  for (const { enable, name, config, factory } of midConfigs) {
    if (!enable) continue
    try {
      serverApp.use(await factory.apply(globalThis, config))
    } catch (e) {
      logger.error(`注册服务器中间件发现错误 --${name}\nerror:`, e, "album")
    }
  }
  if (ssr) await moduleLoader.load(() => SSRModule)
  else await moduleLoader.load(() => SpaModule)
  return serverApp
}
