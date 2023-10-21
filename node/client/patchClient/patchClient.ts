import type { AlbumContext } from "../../context/AlbumContext.js"
import { PluginPatchClientParam, PluginSpecialModuleParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { ClientManager } from "../client.type.js"
import { buildSpecialModules } from "../helper/buildSpecialModule.js"

export async function patchClient(context: AlbumContext, client: ClientManager) {
  const { inputs, plugins, status, configs, logger, manager } = context

  const _specialModules = await buildSpecialModules(context)
  const { specialModules } = await callPluginWithCatch<PluginSpecialModuleParam>(
    plugins.hooks.specialModule,
    {
      context: new Map(),
      api: plugins.event,
      specialModules: _specialModules
    },
    e => logger.error("PluginSpecialModule", e, "album")
  )

  await callPluginWithCatch<PluginPatchClientParam>(
    plugins.hooks.patchClient,
    {
      context: new Map(),
      api: plugins.event,
      status,
      clientConfig: configs.clientConfig,
      inputs,
      fileManager: manager.fileManager,
      specialModules
    },
    e => logger.error("PluginPatchClient", e, "album")
  )

  client.specialModules = specialModules
}
