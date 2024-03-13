import { PluginPatchClientParam } from "@albumjs/album/server"
import { buildRoutesParams } from "./fileParams/buildRoutesParams.js"
import { buildRoutesSSRParams } from "./fileParams/buildRoutesSSRParams.js"
import { ClientRoute, ServerRoute } from "./plugin.type.js"
import { renderTemplate } from "./renderTemplate.js"

export async function pluginPatchFile(clientRoutes: ClientRoute[], serverRoutes: ServerRoute[], params: PluginPatchClientParam) {
  const { info, appManager, dumpFileManager } = params
  const { ssr, inputs } = info
  const { dumpInput } = inputs
  const configs: any[] = [
    {
      type: "file",
      file: "plugin-react/router/routes.tsx",
      params: await buildRoutesParams(clientRoutes, appManager.router.redirect)
    }
  ]

  if (ssr) {
    configs.push({
      type: "file",
      file: "plugin-react/router/routes.ssr.tsx",
      params: buildRoutesSSRParams(serverRoutes, dumpInput)
    })
  }

  await Promise.all(configs.map(async f => dumpFileManager.setFile(f.file, await renderTemplate(f.file, f.params))))
}
