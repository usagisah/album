import { build as esbuild } from "esbuild"
import { existsSync } from "fs"
import { rm } from "fs/promises"
import { resolve } from "path"
import { isFunction, isPlainObject } from "../../utils/check/simple.js"
import { NodeArgs } from "../../utils/command/args.js"
import { Mode } from "../context.type.js"
import { DevInputs } from "../inputs/inputs.type.js"
import { checkUserConfig } from "./checkUserConfig.js"
import { AlbumUserConfig } from "./userConfig.type.js"

export type LoadConfigParams = {
  mode: Mode
  inputs: DevInputs
  args: NodeArgs
}
export async function loadDevConfig({ mode, inputs, args }: LoadConfigParams) {
  const { cwd, albumConfigInput } = inputs
  if (!existsSync(albumConfigInput)) return null

  const output = resolve(cwd, "_$_album.config.mjs")
  await esbuild({
    entryPoints: [albumConfigInput],
    format: "esm",
    outfile: output,
    platform: "node"
  })

  let config: AlbumUserConfig | null = null
  try {
    let exports = (await import(output)).default
    if (isFunction(exports)) exports = exports(mode, args)
    if (isPlainObject(exports)) config = exports as any
  } catch {
  } finally {
    await rm(output, { force: true, recursive: true })
  }

  if (config) checkUserConfig(config)
  return config
}
