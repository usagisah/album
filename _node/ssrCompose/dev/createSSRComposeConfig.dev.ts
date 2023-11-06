import { readdir } from "fs/promises"
import { resolve } from "path"
import { ClientConfig, UserSSRCompose } from "../../context/context.type.js"
import { SSRComposeDevConfig, SSRComposeDevProjectInputs } from "../ssrCompose.type.js"

type SSRComposeConfigParams = {
  appId: string
  ssrCompose?: UserSSRCompose
  clientConfig: ClientConfig
}

export async function createSSRComposeDevConfig({ appId, ssrCompose, clientConfig }: SSRComposeConfigParams): Promise<SSRComposeDevConfig | null> {
  if (!ssrCompose) return null

  const { router, module } = clientConfig
  if (!module) throw "找不到客户端约定式模块级别根目录, ssr-compose 下必须存在合法的模块级别根目录"
  if (appId !== "error" && router.basename.length !== 1) router.basename = "/" + appId + +router.basename

  const projectInputs: SSRComposeDevProjectInputs = new Map()
  const root = resolve(module.modulePath, "../")
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue
    const { name } = fileInfo
    projectInputs.set(name.toLowerCase(), { type: "dev" })
  }

  return {
    projectInputs
  }
}
