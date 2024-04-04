import { AlbumContext } from "../context/context.dev.type.js"
import { buildSpecialModules } from "./specialModules/specialModules.js"

export async function patchClient(context: AlbumContext, updateInfo: { type: "add" | "unlink" | "unlinkDir"; path: string }) {
  const { appManager, fileManager, pluginManager, getStaticInfo, logger } = context
  const { mainInput, mainSSRInput, modules, router, ssrRender } = appManager
  const specialModules = await buildSpecialModules(context)
  await pluginManager.execute("patchClient", {
    logger,
    info: getStaticInfo(),
    updateInfo,
    appManager: { mainInput, mainSSRInput, modules, router, ssrRender, specialModules },
    ...(await fileManager)
  })
  appManager.specialModules = specialModules
}
