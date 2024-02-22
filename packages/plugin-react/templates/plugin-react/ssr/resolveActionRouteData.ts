import { AlbumSSRContext } from "@albumjs/album/server"
import { isPlainObject } from "@albumjs/album/tools"
import { matchPath } from "react-router-dom"
import { serverRoutes } from "../router/routes.ssr"

export async function resolveActionRouteData(ssrContext: AlbumSSRContext) {
  const { params, albumOptions, req, logger } = ssrContext
  const pathname = albumOptions.originalPathname ?? req.path
  const actionData: any = {}
  const route = serverRoutes.find(route => route.reg.test(pathname))
  if (route) {
    const _params = matchPath(route.fullPath, pathname)?.params
    if (_params) Object.assign(params, _params)

    if (route.actionFactory) {
      try {
        const mod: any = await route.actionFactory()
        if (!mod || !(typeof mod.default === "function")) throw "router-action export default is not a function at " + route.actionPath

        const _actionData = await mod.default(ssrContext)
        if (isPlainObject(actionData)) Object.assign(actionData, _actionData)
      } catch (e) {
        logger.error(e, "ssr")
      }
    }
  }

  return actionData
}
