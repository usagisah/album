import { existsSync } from "fs"
import { AlbumDevContext } from "../context/context.type.js"
import { callPluginWithCatch } from "../plugins/callPluginWithCatch.js"
import { isStringEmpty } from "../utils/check/simple.js"
import { buildSpecialModules } from "./buildSpecialModule.js"
import { ClientManager } from "./client.type.js"

export async function initClient(context: AlbumDevContext): Promise<ClientManager> {
  const { info, clientConfig, pluginConfig, appFileManager, dumpFileManager, logger } = context
  const { ssr } = info
  const { events, plugins } = pluginConfig
  const specialModules = await buildSpecialModules(context)
  const { result } = await callPluginWithCatch(
    "initClient",
    plugins,
    {
      messages: new Map(),
      events,
      info: { ...info },
      clientConfig: { ...clientConfig },
      appFileManager,
      dumpFileManager,
      specialModules,
      result: {
        realClientInput: null,
        realSSRInput: null
      }
    },
    logger
  )

  let { realClientInput, realSSRInput } = result
  if (isStringEmpty(realClientInput) || !existsSync(realClientInput!)) throw `client 客户端真实指向入口(client)不存在(${realClientInput})`
  if (ssr && (isStringEmpty(realSSRInput) || !existsSync(realSSRInput!))) throw `client 客户端真实指向入口(SSR)不存在(${realSSRInput})`

  return {
    realClientInput: realClientInput!,
    realSSRInput,
    specialModules
  }
}
