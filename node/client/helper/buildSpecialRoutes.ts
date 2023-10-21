import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import type { SpecialModule, SpecialModuleFile } from "../client.type.js"

type ParseRouterParams = {
  modulePath: string
  moduleName: string
  parentModule: SpecialModule
}

const regLegalModuleName = /^[a-zA-Z][a-zA-Z0-9]*$/
export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: SpecialModule[] = []
  for (const m of await readdir(modulePath, { withFileTypes: true })) {
    if (m.isDirectory()) {
      if (!regLegalModuleName.test(m.name)) continue
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
  const { _page, _router, _action } = findLegalEntries(specialModule.files)
  if (!_page) return false

  if (!parentModule && specialModule.fileName.toLocaleLowerCase() === "home") {
    specialModule.routePath = "/"
  } else if (!parentModule && specialModule.fileName.toLocaleLowerCase() === "error") {
    specialModule.routePath = "/*"
  } else {
    specialModule.routePath = "/" + _page.fileName.slice(0, -5)
  }
  specialModule.routeFilePath = _page.filePath
  specialModule.page = _page

  _router && (specialModule.router = _router)
  _action && (specialModule.action = _action)

  return true
}

function findLegalEntries(files: SpecialModuleFile[]) {
  const result: Record<string, null | SpecialModuleFile> = {}
  const names = ["page", "router", "action"]
  for (const file of files) {
    for (const name of names) {
      const { fileName } = file
      if (fileName === name || fileName.endsWith("." + name)) {
        result["_" + name] = file
      }
    }
  }
  return result
}
