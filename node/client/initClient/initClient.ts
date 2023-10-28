import { existsSync } from "fs"
import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginInitClientParam, PluginSpecialModuleParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { ClientManager } from "../client.type.js"
import { buildSpecialModules } from "../helper/buildSpecialModule.js"

export async function initClient(context: AlbumContext, client: ClientManager) {
  const { app, serverMode, inputs, plugins, status, configs, logger, manager } = context
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

  const { result: initClientResult } = await callPluginWithCatch<PluginInitClientParam>(
    plugins.hooks.initClient,
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
      ssrCompose: configs.ssrCompose,
      result: {
        realClientInput: "",
        realSSRInput: ""
      }
    },
    e => logger.error("PluginInitClient", e, "album")
  )

  if (!existsSync(initClientResult.realClientInput)) {
    throw `client 客户端真实指向入口(client)不存在(${initClientResult.realClientInput})`
  } else {
    inputs.realClientInput = initClientResult.realClientInput
  }

  if (status.ssr && !existsSync(initClientResult.realSSRInput)) {
    throw `client 客户端真实指向入口(SSR)不存在(${initClientResult.realSSRInput})`
  } else {
    inputs.realSSRInput = initClientResult.realSSRInput
  }

  client.specialModules = specialModules
}
