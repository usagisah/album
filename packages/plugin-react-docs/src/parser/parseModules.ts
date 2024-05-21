import { AppSpecialModule } from "@albumjs/album/server"
import { readFile } from "fs/promises"
import { parse, resolve } from "path"
import { pathToRegexp } from "path-to-regexp"
import { MDRoute, PluginContext } from "../docs.type.js"
import { parseSearchContent } from "./parseSearchContent.js"

export async function parseModules(specialModules: AppSpecialModule[][], context: PluginContext, langDirs: string[]) {
  const routes: MDRoute[] = []
  const routeMap = new Map<string, MDRoute>()

  await Promise.all(
    specialModules.map(async (item, index) => {
      const lang = langDirs[index - 1] ?? ""
      for (const module of item) {
        const { pageFile, routePath } = module
        const { appName, filepath, ext } = pageFile

        if (routePath.includes("*")) {
          continue
        }

        const routePathReg = pathToRegexp((lang.length > 0 ? `/${lang}` : lang) + routePath, null, { sensitive: false })
        const route: MDRoute = {
          appName,
          filepath,
          isErrorPage: false,
          routePath: lang + routePath,
          buildOutPath: normalizeOutName(lang, routePath),
          match: routePathReg,
          ext
        }
        routes.push(route)
        routeMap.set(filepath, route)

        const searchContents = parseSearchContent(parse(filepath).name, await readFile(filepath, "utf-8"))
        context.searchMDMap.set(filepath, { route: route.routePath, contents: searchContents })
      }
    })
  )

  mixinErrorRoute(routes, routeMap, context)

  return { routes, routeMap }
}

function mixinErrorRoute(routes: MDRoute[], routeMap: Map<string, MDRoute>, context: PluginContext) {
  const { dumpInput } = context.albumContext.inputs
  const route = {
    appName: "error",
    filepath: resolve(dumpInput, "plugin-react-docs/mds/error.md"),
    isErrorPage: true,
    routePath: "/error",
    buildOutPath: "error.html",
    match: pathToRegexp("/:error", null, { sensitive: false }),
    ext: "tsx"
  }
  routes.push(route)
  routeMap.set(route.filepath, route)
}

function normalizeOutName(lang: string, path: string) {
  if (path.endsWith("/")) {
    path += "index"
  }

  let name = `${lang}${path}.html`
  if (name.startsWith("/")) {
    name = name.slice(1)
  }
  return name
}
