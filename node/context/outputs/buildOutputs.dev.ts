import { resolve } from "path"
import { DevInputs } from "../inputs/inputs.type.js"
import { DevServerConfig } from "../server/serverConfig.type.js"
import { DevOutputs } from "./outputs.type.js"

export function buildOutputs(appId: string, ssr: boolean, inputs: DevInputs, serverConfig: DevServerConfig): DevOutputs {
  const outputs: DevOutputs = { outBase: "", outDir: "", clientOutDir: "", ssrOutDir: null, apiOutDir: "" }
  const { cwd } = inputs

  const baseOutDir = (outputs.outBase = resolve(cwd, "dist"))
  const outDir = (outputs.outDir = resolve(baseOutDir, appId === "default" ? "" : appId))

  if (serverConfig.appModule.input) outputs.apiOutDir = resolve(outDir, "api")

  if (ssr) {
    outputs.clientOutDir = resolve(outDir, "client")
    outputs.ssrOutDir = resolve(outDir, "ssr")
  } else {
    outputs.clientOutDir = outDir
  }
  return outputs
}
