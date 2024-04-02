import { AlbumContext } from "../context/context.dev.type.js"
import { buildSpecialModules } from "./specialModule.js"

export async function initClient(context: AlbumContext) {
  const { appManager, fileManager, pluginManager, getStaticInfo } = context
  const { mainInput, mainSSRInput, modules, router, ssrRender } = appManager
  const specialModules = await buildSpecialModules(context)

  const { realClientInput, realSSRInput } = await pluginManager.execute("initClient", {
    ...(await fileManager),
    info: getStaticInfo(),
    appManager: { mainInput, mainSSRInput, modules, router, ssrRender, specialModules },
    realClientInput: null,
    realSSRInput: null
  })
  appManager.realClientInput = realClientInput
  appManager.realSSRInput = realSSRInput ?? ""
  appManager.specialModules = specialModules
}
