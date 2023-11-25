import { readdir } from "fs/promises"
import { resolve } from "path"
import { ClientConfig, UserSSRCompose } from "../../context/context.type.js"
import { SSRComposeDevConfig, SSRComposeDevProjectInputs } from "../ssrCompose.type.js"

type SSRComposeConfigParams = {
  appId: string
  ssrCompose?: UserSSRCompose
  clientConfig: ClientConfig
}

export async function createSSRComposeConfig({ appId, ssrCompose, clientConfig }: SSRComposeConfigParams): Promise<SSRComposeDevConfig | null> {
  if (!ssrCompose) return null

  const { router, module } = clientConfig
  if (appId !== "error" && router.basename.length !== 1) router.basename = "/" + appId + +router.basename

  const projectInputs: SSRComposeDevProjectInputs = new Map()
  const root = resolve(module!.modulePath, "../")
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue
    const { name } = fileInfo
    projectInputs.set(name.toLowerCase(), { type: "dev" })
  }

  return { projectInputs }
}
