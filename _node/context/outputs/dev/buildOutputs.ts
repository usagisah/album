import { resolve } from "path"
import { DevInputs } from "../../inputs/inputs.type.js"
import { DevOutputs } from "../outputs.type.js"

export function buildOutputs(appId: string, ssr: boolean, inputs: DevInputs): DevOutputs {
  const outputs: DevOutputs = { clientOutDir: "", ssrOutDir: null }
  const { cwd } = inputs
  const baseOutDir = resolve(cwd, "dist")
  const targetDir = appId === "default" ? "" : appId
  if (ssr) {
    outputs.clientOutDir = resolve(baseOutDir, targetDir, "client")
    outputs.ssrOutDir = resolve(baseOutDir, targetDir, "server")
  } else {
    outputs.clientOutDir = resolve(baseOutDir, targetDir)
  }
  return outputs
}
