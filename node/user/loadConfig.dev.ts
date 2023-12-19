import { build as esbuild } from "esbuild"
import { existsSync } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { createPluginManager } from "plugins/pluginManager.dev.js"
import { ServerMode } from "../cli/cli.type.js"
import { Inputs } from "../context/context.dev.type.js"
import { Logger } from "../modules/logger/logger.js"
import { isFunction, isPlainObject } from "../utils/check/simple.js"
import { NodeArgs } from "../utils/command/args.js"
import { checkUserConfig } from "./checkUserConfig.js"
import { AlbumUserConfig } from "./user.dev.type.js"

export type LoadConfigParams = {
  serverMode: ServerMode
  inputs: Inputs
  args: NodeArgs
}

export async function loadConfig({ serverMode, inputs, args }: LoadConfigParams) {
  const { cwd, albumConfigInput } = inputs
  if (!existsSync(albumConfigInput)) throw "好不到配置文件"

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
  } catch {
  } finally {
    await rm(output, { force: true, recursive: true })
  }
  checkUserConfig(config)

  const logger = new Logger(isPlainObject(config.logger) ? config.logger : undefined)
  const pluginManager = createPluginManager({ userPlugin: config.plugins, logger })
  const { config: userConfig } = await pluginManager.execute("config", { serverMode, config })
  return { userConfig, pluginManager, logger }
}
