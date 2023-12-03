import { readdir } from "fs/promises"
import { dirname } from "path"
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
  // if (appId !== "error") {
  //   router.basename = "/" + appId + router.basename
  //   if (router.basename.startsWith("//")) router.basename = router.basename.slice(1)
  //   else if (router.basename.endsWith("/")) router.basename = router.basename.slice(0, -1)
  // }

  const projectInputs: SSRComposeDevProjectInputs = new Map()
  const root = dirname(module!.modulePath)
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue
    const { name } = fileInfo
    projectInputs.set(name.toLowerCase(), {})
  }

  const { dependencies } = ssrCompose
  const _dependencies = dependencies ? [...new Set(dependencies)] : []

  return { projectInputs, dependencies: _dependencies }
}
