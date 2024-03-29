import { AppSpecialModule } from "@albumjs/album/server"
import { pathToRegexp } from "path-to-regexp"
import { MDRoute, PluginContext } from "../docs.type.js"

type ParseOptions = {
  context: PluginContext
}

export async function parseModules(specialModules: AppSpecialModule[], context: PluginContext) {
  nextModules(specialModules, { context })
}

function nextModules(specialModules: AppSpecialModule[], options: ParseOptions) {
  const { context } = options
  const { routeMap, routes } = context
  for (const module of specialModules) {
    const { pageFile, routePath, children } = module
    const { filepath, ext } = pageFile
    const routePathReg = pathToRegexp(routePath, null, { sensitive: false })
    const route: MDRoute = {
      filepath,
      buildOutPath: normalizeOutName(routePath),
      match: routePathReg,
      ext
    }
    routes.push(route)
    routeMap.set(filepath, route)
    nextModules(children, options)
  }
}

function normalizeOutName(name: string) {
  if (name === "/") {
    name = "index"
  } else if (name === "/*") {
    name = "404"
  }
  if (!name.startsWith("/")) {
    name = "/" + name
  }
  return `${name}.html`.slice(1)
}
