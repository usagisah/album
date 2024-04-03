import { AppSpecialModule } from "@albumjs/album/server"
import { pathToRegexp } from "path-to-regexp"
import { MDRoute, PluginContext } from "../docs.type.js"

export async function parseModules(specialModules: AppSpecialModule[], context: PluginContext, lang = "") {
  const { routeMap, routes } = context
  debugger
  for (const module of specialModules) {
    const { pageFile, routePath } = module
    const { appName, filepath, ext } = pageFile
    const routePathReg = pathToRegexp((lang.length > 0 ? `/${lang}` : lang) + routePath, null, { sensitive: false })
    const route: MDRoute = {
      appName,
      filepath,
      buildOutPath: normalizeOutName(lang, routePath),
      match: routePathReg,
      ext
    }
    routes.push(route)
    routeMap.set(filepath, route)
  }
}

function normalizeOutName(lang: string, path: string) {
  if (path === "/") {
    path = "index"
  }
  if (!path.startsWith("/")) {
    path = "/" + path
  }
  let name = `${lang}${path}.html`
  if (name.startsWith("/")) {
    name = name.slice(1)
  }
  return name
}
