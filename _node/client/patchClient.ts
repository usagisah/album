import { AlbumDevContext } from "../context/context.type.js"
import { buildSpecialModules } from "./buildSpecialModule.js"
import { callPluginWithCatch } from "../context/plugins/callPluginWithCatch.js"

export async function patchClient(context: AlbumDevContext) {
  const { info, clientConfig, clientManager, pluginConfig, appFileManager, dumpFileManager, logger } = context
  const { events, plugins } = pluginConfig
  const specialModules = await buildSpecialModules(context)
  await callPluginWithCatch(
    "patchClient",
    plugins,
    {
      messages: new Map(),
      events,
      info: { ...info },
      clientConfig: { ...clientConfig },
      appFileManager,
      dumpFileManager,
      specialModules,
    },
    logger
  )
  clientManager!.specialModules = specialModules
}
