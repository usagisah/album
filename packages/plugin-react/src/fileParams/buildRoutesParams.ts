export async function buildRoutesParams(routes: any[], redirect: Record<string, string>) {
  let str_defines = ""
  let str_imports = ""
  let str_useRoutes = `[${mapRedirectToRoute()}${nextRoute(routes, 0)}]`
  function nextRoute(routes: any[], deep: number) {
    let _useRoute_code = ""
    for (const route of routes) {
      // import router meta
      let _import_meta = null
      if (route.router) {
        _import_meta = route.name + "_meta"
        str_imports += `import ${_import_meta} from "${route.router}";`
      }

      // lazy import component
      str_defines += `const ${route.name} = ${route.component};`

      // routers = []
      const childrenUseRoutes = nextRoute(route.children, deep + 1)
      const _component =
        deep === 0
          ? `({onEnter}: any, route: any) => <GuardRoute route={route} onEnter={onEnter}>{${route.name}}</GuardRoute>`
          : `(_: any, route: any) => <GuardRoute route={route}>{${route.name}}</GuardRoute>`
      const _useRoute =
        "{" +
        [
          `parent: null`,
          `name: "${route.name}"`,
          `path: "${route.path}"`,
          `fullPath: "${route.fullPath}"`,
          `component: ${_component}`,
          `meta: ${_import_meta ?? "{}"}`,
          `children: [${childrenUseRoutes}]`
        ].join(",") +
        "},"
      _useRoute_code += _useRoute
    }
    return _useRoute_code
  }

  function mapRedirectToRoute() {
    let counter = 0
    const route_code: string[] = []
    for (let from in redirect) {
      const to = redirect[from]
      route_code.push(
        " { " +
          [
            "parent: null",
            `name: "${"redirect_" + counter++}"`,
            `path: "${from}"`,
            `fullPath: "${from}"`,
            `component: <Navigate to="${to}" replace={true} />`,
            `meta: {}`,
            `children: []`
          ].join(", ") +
          " },"
      )
    }
    return route_code.join("")
  }

  return { str_defines, str_imports, str_useRoutes }
}
