import { resolve } from "path"
import { StartInputs } from "./inputs.type.js"

export function buildStartInputs(): StartInputs {
  const cwd = process.cwd()
  return {
    cwd,
    root: null,
    albumConfigInput: resolve(cwd, "album.config.js")
  }
}
