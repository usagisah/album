import { AlbumContext } from "../../context/AlbumContext.js"
import { SpecialModule } from "../client.type.js"
import { walkModules } from "./buildSpecialRoutes.js"

export async function buildSpecialModules(context: AlbumContext): Promise<SpecialModule[]> {
  const module = context.configs.clientConfig.module
  if (!module) return []

  const { moduleName, modulePath } = module
  return await walkModules({
    modulePath,
    moduleName,
    parentModule: null
  })
}
