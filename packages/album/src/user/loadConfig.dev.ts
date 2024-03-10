import { build as esbuild } from "@albumjs/tools/lib/esbuild"
import { isFunction, isPlainObject, NodeArgs } from "@albumjs/tools/node"
import { existsSync } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { Inputs } from "../context/context.dev.type.js"
import { createAlbumLogger } from "../logger/logger.js"
import { createPluginManager } from "../plugins/pluginManager.dev.js"
import { ServerMode } from "../service/service.type.js"
import { checkUserConfig } from "./checkUserConfig.js"
import { AlbumUserConfig } from "./user.dev.type.js"

export type LoadConfigParams = {
  serverMode: ServerMode
  inputs: Inputs
  args: NodeArgs
}

export async function loadConfig({ serverMode, inputs, args }: LoadConfigParams) {
  const { cwd, albumConfigInput } = inputs

  const output = resolve(cwd, "_$_album.config.mjs")
  await esbuild({
    entryPoints: [albumConfigInput],
    format: "esm",
    outfile: output,
    platform: "node"
  })

  let config: AlbumUserConfig = {}
  try {
    let exports = (await import(output)).default
    if (isFunction(exports)) exports = exports(serverMode, args)
    if (isPlainObject(exports)) config = exports as any
  } finally {
    rm(output, { force: true, recursive: true })
  }
  checkUserConfig(config)

  const logger = await createAlbumLogger(config.logger)
  const pluginManager = createPluginManager({ userPlugin: config.plugins, logger })
  const { config: userConfig } = await pluginManager.execute("config", { serverMode, config })
  return { userConfig, pluginManager, logger }
}
