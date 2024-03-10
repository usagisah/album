import { isBlank } from "@albumjs/tools/node"
import { AlbumContext } from "../context/context.dev.type.js"
import { buildSpecialModules } from "./specialModule.js"

export async function initClient(context: AlbumContext) {
  const { ssr, appManager, fileManager, pluginManager, getStaticInfo } = context
  const { mainInput, mainSSRInput, module, router, ssrRender } = appManager
  const specialModules = await buildSpecialModules(context)
  const { result } = await pluginManager.execute("initClient", {
    info: getStaticInfo(),
    appManager: { mainInput, mainSSRInput, module, router, ssrRender, specialModules },
    ...(await fileManager),
    result: {
      realClientInput: null,
      realSSRInput: null
    }
  })

  let { realClientInput, realSSRInput } = result
  if (isBlank(realClientInput)) throw `client 客户端真实指向入口(client)不存在(${realClientInput})`
  if (ssr && isBlank(realSSRInput)) throw `client 客户端真实指向入口(SSR)不存在(${realSSRInput})`

  appManager.realClientInput = realClientInput!
  appManager.realSSRInput = realSSRInput ?? ""
  appManager.specialModules = specialModules
}
