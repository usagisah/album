import { AlbumDevContext } from "../context/context.type.js"
import { resolveModules, walkModules } from "./buildSpecialRoutes.js"
import { SpecialModule } from "./client.type.js"

export async function buildSpecialModules(context: AlbumDevContext): Promise<SpecialModule[]> {
  const { clientConfig, logger, info } = context
  const { module } = clientConfig
  if (!module) return []

  const { moduleName, modulePath } = module
  const { ssrCompose } = info
  if (ssrCompose) {
    const res = await resolveModules({ logger, modulePath, moduleName, parentModule: null })
    return res ? [res] : []
  }
  return await walkModules({
    logger,
    modulePath,
    moduleName,
    parentModule: null
  })
}
