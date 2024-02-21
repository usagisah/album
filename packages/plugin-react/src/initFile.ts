import { PluginInitClientParam } from "@albumjs/album/server"
import { createCommonJS } from "@albumjs/tools/lib/mlly"
import { readFile } from "fs/promises"
import { relative, resolve } from "path"
import { buildMainParams } from "./fileParams/buildMainParams.js"
import { buildRoutesParams } from "./fileParams/buildRoutesParams.js"
import { buildRoutesSSRParams } from "./fileParams/buildRoutesSSRParams.js"
import { ClientRoute, ServerRoute } from "./plugin.type.js"
import { renderTemplate } from "./renderTemplate.js"

const { __dirname } = createCommonJS(import.meta.url)

export async function pluginInitFile(clientRoutes: ClientRoute[], serverRoutes: ServerRoute[], param: PluginInitClientParam) {
  const pendingPromises: Promise<any>[] = []
  const { info, appManager, dumpFileManager } = param
  const { appId, ssr, ssrCompose, inputs } = info
  const { dumpInput } = inputs
  const { mainSSRInput, router } = appManager

  pendingPromises.push(...mountEntry(param), ...common(clientRoutes, param))

  if (ssr) {
    const ssrConfigs = [
      { type: "file", template: "main.ssr.tsx", params: {} },
      { type: "file", template: "plugin-react/hooks/useServer.ts", params: {} },
      { type: "file", template: "plugin-react/hooks/useServerRouteData.ts", params: {} },
      {
        type: "file",
        template: "plugin-react/router/createSSRRouter.tsx",
        params: {
          basename: router.basename,
          RemoteAppLoader: ssrCompose ? `import { createRemoteAppLoader } from "../ssr-compose/RemoteAppLoader"\nregistryHook("createRemoteAppLoader", createRemoteAppLoader)` : ""
        }
      },
      { type: "file", template: "plugin-react/router/routes.ssr.tsx", params: buildRoutesSSRParams(serverRoutes, dumpInput) },
      { type: "file", template: "plugin-react/ssr/resolveActionRouteData.ts", params: {} },
      { type: "file", template: "plugin-react/ssr/SSRContext.ts", params: {} },
      {
        type: "file",
        template: "plugin-react/ssr/ssrRender.tsx",
        params: {
          mainServerPath: relative(resolve(dumpInput, "plugin-react/ssr"), mainSSRInput)
        }
      },
      { type: "file", template: "plugin-react/ssr/SSRServerShared.tsx", params: {} },

      { type: "file", template: "plugin-react/ssr-compose/browser.ts", params: { appId } },
      { type: "file", template: "plugin-react/ssr-compose/cacheManifest.ts", params: {} },
      { type: "file", template: "plugin-react/ssr-compose/RemoteAppLoader.ts", params: {} },
      { type: "file", template: "plugin-react/ssr-compose/renderCompToString.tsx", params: {} },
      { type: "file", template: "plugin-react/ssr-compose/renderRemoteComponent.tsx", params: {} },
      { type: "file", template: "plugin-react/ssr-compose/ssr-compose.type.ts", params: {} },
      { type: "file", template: "plugin-react/ssr-compose/SSRComposeContext.ts", params: {} }
    ]

    pendingPromises.push(
      ...ssrConfigs.map(async f => {
        return dumpFileManager.add(f.type as any, f.template, {
          value: await renderTemplate(f.template, f.params)
        })
      })
    )
  }

  await Promise.all(pendingPromises)
}

function mountEntry({ info, appFileManager, dumpFileManager }: PluginInitClientParam) {
  const { ssr, ssrCompose } = info
  const pendingSetFiles: Promise<any>[] = [
    appFileManager.setFile("album-env.d.ts", f => {
      const typePlugin = `/// <reference types=".album/plugin-react" />`
      return f.includes(typePlugin) ? f : `${f}\n${typePlugin}\n`
    }),
    dumpFileManager.add("file", "plugin-react.d.ts", {
      async value() {
        let code = await readFile(resolve(__dirname, "../album.d.ts"), "utf-8")
        if (!ssrCompose) {
          code = remoteBlock(code, "ssr-compose")
        }
        return code
      }
    }),
    dumpFileManager.setFile("album.client.ts", () => {
      const code = [
        `import { routes, routesMap } from "./plugin-react/router/routes"`,
        `export { useRouter } from "./plugin-react/hooks/useRouter"`,
        `export { useLoader } from "./plugin-react/hooks/useLoader"`,
        `export const useRoutes = () => routes`,
        `export const useRoutesMap = () => routesMap`
      ]
      if (ssrCompose) {
        code.push(`export { createRemoteAppLoader } from "./plugin-react/ssr-compose/RemoteAppLoader"`)
      }
      return code.join("\n") + "\n"
    })
  ]
  if (ssr) {
    dumpFileManager.setFile("album.server.ts", f => {
      const code = [`export { useServer } from "./plugin-react/hooks/useServer"`, `export { useServerRouteData } from "./plugin-react/hooks/useServerRouteData"`]
      if (ssrCompose) {
        code.push(`export { createRemoteAppLoader } from "./plugin-react/ssr-compose/RemoteAppLoader"`)
      }
      return code.join("\n") + "\n"
    })
  }
  return pendingSetFiles
}
function remoteBlock(code: string, title: string) {
  return code.replace(new RegExp(`/\\* -+ ${title} -+ \\*/[\\s\\S]+/\\* -+ ${title}-end -+ \\*/\\n`), "")
}

function common(clientRoutes: any[], param: PluginInitClientParam) {
  const { dumpFileManager } = param
  const clientConfigs = [
    { type: "file", template: "plugin-react/hooks/useLoader.ts", params: {} },
    { type: "file", template: "plugin-react/hooks/useRouter.ts", params: {} },
    { type: "file", template: "plugin-react/utils/callWithCatch.ts", params: {} },
    { type: "file", template: "plugin-react/router/GuardRoute.tsx", params: {} },
    { type: "file", template: "plugin-react/router/lazyLoad.tsx", params: {} },
    { type: "file", template: "plugin-react/router/RouteContext.tsx", params: {} },
    { type: "file", template: "plugin-react/router/routes.tsx", params: buildRoutesParams(clientRoutes) },
    { type: "file", template: "main.tsx", params: buildMainParams(param) }
  ]
  return clientConfigs.map(async f => {
    return dumpFileManager.add(f.type as any, f.template, {
      value: await renderTemplate(f.template, f.params)
    })
  })
}
