import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import { ILogger } from "../modules/logger/logger.type.js"
import { SpecialModule, SpecialModuleFile } from "./client.type.js"

type ParseRouterParams = {
  modulePath: string
  moduleName: string
  parentModule: SpecialModule | null
  logger: ILogger
}

export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: SpecialModule[] = []
  for (const m of await readdir(modulePath, { withFileTypes: true })) {
    if (m.isDirectory()) {
      const res = await resolveModules({ ...params, modulePath: resolve(modulePath, m.name) })
      if (!res) continue
      modules.push(res)
    }
  }
  return modules
}

const regLegalModuleName = /^[a-zA-Z][a-zA-Z0-9]*$/
export async function resolveModules(params: ParseRouterParams) {
  const { moduleName, modulePath, parentModule, logger } = params
  const filename = basename(modulePath)
  if (!regLegalModuleName.test(filename)) {
    logger.warn("约定式模块的文件夹名称，只支持以字母开头的，字符与数字混合的名称", "album")
    return
  }

  const files: SpecialModuleFile[] = []
  const dirFiles = await readdir(modulePath, { encoding: "utf-8", withFileTypes: true })
  let childModuleDir: Dirent | null = null
  for (const file of dirFiles) {
    const filename = file.name
    const filepath = resolve(modulePath, file.name)

    if (file.isDirectory()) {
      if (filename === moduleName) childModuleDir = file
      continue
    }

    const { name, ext } = pathParse(filename)
    files.push({
      type: "file",
      filepath,
      filename,
      // xxx.page. 这是不合法的
      appName: ext.length <= 1 ? filename : name,
      ext
    })
  }

  const res = buildRoute({ filename, files, parentModule })
  if (!res) return

  const specialModule: SpecialModule = {
    type: "module",
    filename,
    filepath: modulePath,
    files,
    children: [],
  
    pageFile: res.pageFile,
    routerFile: res.routerFile,
    actionFile: res.actionFile,
    routePath: res.routePath
  }

  if (childModuleDir) {
    specialModule.children = await walkModules({
      moduleName,
      modulePath: resolve(modulePath, childModuleDir.name),
      parentModule: specialModule,
      logger
    })
  }

  return specialModule
}

type BuildRouteParams = {
  filename: string
  files: SpecialModuleFile[]
  parentModule: SpecialModule | null
}

function buildRoute({ filename, files, parentModule }: BuildRouteParams) {
  const { _page: pageFile, _router: routerFile, _action: actionFile } = findLegalEntries(files)
  if (!pageFile) return false

  let routePath = ""
  if (!parentModule && filename.toLocaleLowerCase() === "home") routePath = "/"
  else if (!parentModule && filename.toLocaleLowerCase() === "error") routePath = "/*"
  else routePath = "/" + pageFile.filename.slice(0, -5)

  return { pageFile, routerFile, actionFile, routePath }
}

function findLegalEntries(files: SpecialModuleFile[]) {
  const specialSuffixes = ["page", "router", "action"]
  const result: Record<string, null | SpecialModuleFile> = { _page: null, _router: null, _action: null }
  for (const file of files) {
    for (const suffix of specialSuffixes) {
      const { appName } = file
      if (appName === suffix || appName.endsWith("." + suffix)) result["_" + suffix] = file
    }
  }
  return result
}
