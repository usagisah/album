import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginPatchClientParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { ClientManager } from "../client.type.js"
import { buildSpecialModules } from "../helper/buildSpecialModule.js"

export async function patchClient(context: AlbumContext, client: ClientManager) {
  const { app, serverMode, inputs, plugins, status, configs, logger, manager } = context
  const specialModules = await buildSpecialModules(context)
  await callPluginWithCatch<PluginPatchClientParam>(
    plugins.hooks.patchClient,
    {
      context: new Map(),
      api: plugins.event,
      app,
      serverMode,
      status,
      clientConfig: configs.clientConfig,
      inputs,
      fileManager: manager.fileManager,
      specialModules,
      ssrCompose: configs.ssrCompose
    },
    e => logger.error("PluginPatchClient", e, "album")
  )

  client.specialModules = specialModules
}
