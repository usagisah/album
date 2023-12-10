import { build as esbuild } from "esbuild"
import { existsSync } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { ServerMode } from "../../../cli/cli.type.js"
import { isFunction, isPlainObject } from "../../../utils/check/simple.js"
import { NodeArgs } from "../../../utils/command/args.js"
import { DevInputs } from "../../inputs/inputs.type.js"
import { checkUserConfig } from "../checkUserConfig.js"
import { AlbumUserConfig } from "../userConfig.type.js"

export type LoadConfigParams = {
  serverMode: ServerMode
  inputs: DevInputs
  args: NodeArgs
}
export async function loadConfig({ serverMode, inputs, args }: LoadConfigParams) {
  const { cwd, albumConfigInput } = inputs
  if (!existsSync(albumConfigInput)) return {}

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

  if (config) checkUserConfig(config)
  return config
}
