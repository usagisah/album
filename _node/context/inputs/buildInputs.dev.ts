import { resolve } from "path"
import { DevInputs } from "./inputs.type.js"

export function buildDevInputs(): DevInputs {
  const cwd = process.cwd()
  return {
    cwd,
    root: cwd,
    dumpInput: resolve(cwd, ".album"),
    albumConfigInput: resolve(cwd, "album.config.ts")
  }
}
