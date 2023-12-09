import { resolve } from "path"
import { DevInputs } from "../inputs/inputs.type.js"
import { DevServerConfig } from "../server/serverConfig.type.js"
import { DevOutputs } from "./outputs.type.js"

export function buildOutputs(appId: string, ssr: boolean, inputs: DevInputs, serverConfig: DevServerConfig): DevOutputs {
  const outputs: DevOutputs = {
    outBase: "",
    outDir: null,
    clientOutDir: "",
    ssrOutDir: null,
    apiOutDir: ""
  }
  const { cwd } = inputs

  const baseOutDir = (outputs.outBase = resolve(cwd, "dist"))
  const targetDir = resolve(baseOutDir, appId === "default" ? "" : appId)

  if (serverConfig.appModule.input) {
    const { filename } = serverConfig.appModule
    outputs.apiOutDir = resolve(targetDir, "api", filename)
  }

  if (ssr) {
    const outDir = (outputs.outDir = targetDir)
    outputs.clientOutDir = resolve(outDir, "client")
    outputs.ssrOutDir = resolve(outDir, "ssr")
  } else {
    outputs.outDir = outputs.clientOutDir = targetDir
  }
  return outputs
}
