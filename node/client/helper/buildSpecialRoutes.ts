import type { SpecialModule } from "../client.type.js"
import { readdir } from "fs/promises"
import { Dirent } from "fs"
import { basename, parse as pathParse, resolve } from "path"

type ParseRouterParams = {
  modulePath: string
  moduleName: string
  parentModule: SpecialModule
}

export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: SpecialModule[] = []
  for (const m of await readdir(modulePath, { withFileTypes: true })) {
    if (m.isDirectory()) {
      const res = await resolveModules({
        ...params,
        modulePath: resolve(modulePath, m.name)
      })
      if (!res) continue
      modules.push(res)
    }
  }
  return modules
}

async function resolveModules(params: ParseRouterParams) {
  const { moduleName, modulePath, parentModule } = params
  const specialModule: SpecialModule = {
    type: "module",
    fileName: basename(modulePath),
    filePath: modulePath,
    router: null,
    page: null,
    action: null,
    routePath: "",
    routeFilePath: "",
    files: [],
    children: [],
    meta: new Map()
  }

  const files = await readdir(modulePath, {
    encoding: "utf-8",
    withFileTypes: true
  })

  let moduleDir: Dirent
  for (const file of files) {
    const fullName = file.name
    const filePath = resolve(modulePath, file.name)

    if (file.isDirectory()) {
      if (fullName === moduleName) {
        moduleDir = file
      }
      continue
    }

    const info = pathParse(fullName)
    specialModule.files.push({
      type: "file",
      filePath,
      fullName,
      // xxx.page. 这是不合法的
      fileName: info.ext.length <= 1 ? info.name + info.ext : info.name,
      fileExt: info.ext
    })
  }

  if (!buildRoute({ specialModule, parentModule })) return

  if (moduleDir) {
    specialModule.children = await walkModules({
      moduleName,
      modulePath: resolve(modulePath, moduleDir.name),
      parentModule: specialModule
    })
  }

  return specialModule
}

type BuildRouteParams = {
  specialModule: SpecialModule
  parentModule: SpecialModule
}

function buildRoute({ specialModule, parentModule }: BuildRouteParams) {
  const _page = specialModule.files.find(f => f.fileName.endsWith(".page"))
  if (!_page) return false

  if (!parentModule && specialModule.fileName === "Home") {
    specialModule.routePath = "/"
  } else if (!parentModule && specialModule.fileName === "Error") {
    specialModule.routePath = "/*"
  } else {
    specialModule.routePath = "/" + _page.fileName.slice(0, -5)
  }
  specialModule.routeFilePath = _page.filePath
  specialModule.page = _page

  const _router = specialModule.files.find(f => f.fileName.endsWith(".router"))
  _router && (specialModule.router = _router)

  const _action = specialModule.files.find(f => f.fileName.endsWith(".action"))
  _action && (specialModule.action = _action)

  return true
}
