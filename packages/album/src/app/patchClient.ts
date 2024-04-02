import { AlbumContext } from "../context/context.dev.type.js"
import { buildSpecialModules } from "./specialModules/specialModules.js"

export async function patchClient(context: AlbumContext, updateInfo: { type: string; path: string }) {
  const { appManager, fileManager, pluginManager, getStaticInfo } = context
  const { mainInput, mainSSRInput, modules, router, ssrRender } = appManager
  const specialModules = await buildSpecialModules(context)
  await pluginManager.execute("patchClient", {
    info: getStaticInfo(),
    updateInfo,
    appManager: { mainInput, mainSSRInput, modules, router, ssrRender, specialModules },
    ...(await fileManager)
  })
  appManager.specialModules = specialModules
}
