import { resolve } from "path"
import { DevInputs } from "../inputs/inputs.type.js"
import { DevOutputs } from "./outputs.type.js"

export function buildOutputs(appId: string, ssr: boolean, inputs: DevInputs): DevOutputs {
  const outputs: DevOutputs = { outDir: null, clientOutDir: "", ssrOutDir: null }
  const { cwd } = inputs
  const baseOutDir = resolve(cwd, "dist")
  const targetDir = appId === "default" ? "" : appId
  if (ssr) {
    const outDir = (outputs.outDir = resolve(baseOutDir, targetDir))
    outputs.clientOutDir = resolve(outDir, "client")
    outputs.ssrOutDir = resolve(outDir, "ssr")
  } else {
    outputs.outDir = outputs.clientOutDir = resolve(baseOutDir, targetDir)
  }
  return outputs
}
