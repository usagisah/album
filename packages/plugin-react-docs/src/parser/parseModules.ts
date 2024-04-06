import { AppSpecialModule } from "@albumjs/album/server"
import { resolve } from "path"
import { pathToRegexp } from "path-to-regexp"
import { MDRoute, PluginContext } from "../docs.type.js"

export async function parseModules(specialModules: AppSpecialModule[][], context: PluginContext, langDirs: string[]) {
  const routes: MDRoute[] = []
  const routeMap = new Map<string, MDRoute>()
  specialModules.map((item, index) => {
    const lang = langDirs[index - 1] ?? ""
    for (const module of item) {
      const { pageFile, routePath } = module
      const { appName, filepath, ext } = pageFile

      if (routePath !== "/*" && routePath.includes("*")) {
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
    }
  })
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
  return { routes, routeMap }
}

function normalizeOutName(lang: string, path: string) {
  if (path === "/") {
    path = "index"
  }
  if (!path.startsWith("/")) {
    path = "/" + path
  }
  if (path === "/*") {
    path = "/error"
  }
  let name = `${lang}${path}.html`
  if (name.startsWith("/")) {
    name = name.slice(1)
  }
  return name
}
