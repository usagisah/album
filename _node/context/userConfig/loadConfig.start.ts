import { existsSync } from "fs"
import { isFunction, isPlainObject } from "../../utils/check/simple.js"
import { NodeArgs } from "../../utils/command/args.js"
import { Mode } from "../context.type.js"
import { DevInputs } from "../inputs/inputs.type.js"

export type LoadConfigParams = {
  mode: Mode
  inputs: DevInputs
  args: NodeArgs
}
export async function loadStartConfig({ mode, inputs, args }: LoadConfigParams) {
  const { albumConfigInput } = inputs
  if (!existsSync(albumConfigInput)) return null

  let config: any = null
  try {
    let exports = (await import(albumConfigInput)).default
    if (isFunction(exports)) exports = exports(mode, args)
    if (isPlainObject(exports)) config = exports
  } catch {}
  return config
}
