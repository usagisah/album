import { AlbumContext } from "../context/context.dev.type.js"
import { buildSpecialModules } from "./specialModule.js"

export async function patchClient(context: AlbumContext) {
  const { appManager, fileManager, pluginManager, getStaticInfo } = context
  const { mainInput, mainSSRInput, module, router, ssrRender } = appManager
  const specialModules = await buildSpecialModules(context)
  await pluginManager.execute("patchClient", {
    info: getStaticInfo(),
    appManager: { mainInput, mainSSRInput, module, router, ssrRender, specialModules },
    ...(await fileManager)
  })
  appManager.specialModules = specialModules
}
