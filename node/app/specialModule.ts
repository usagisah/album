import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import { AlbumContext } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { AppSpecialModule, AppSpecialModuleFile } from "./app.dev.type.js"

export async function buildSpecialModules(context: AlbumContext): Promise<AppSpecialModule[]> {
  const { ssrCompose, appManager, logger } = context
  const { module } = appManager
  if (ssrCompose) {
    const res = await resolveModules({ logger, parentModule: null, ...module })
    return res ? [res] : []
  }
  return await walkModules({ logger, parentModule: null, ...module })
}

type ParseRouterParams = {
  modulePath: string
  moduleName: string
  ignore: RegExp[]
  parentModule: AppSpecialModule | null
  logger: ILogger
}

export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: AppSpecialModule[] = []
  for (const m of await readdir(modulePath, { withFileTypes: true })) {
    if (m.isDirectory()) {
      const res = await resolveModules({ ...params, modulePath: resolve(modulePath, m.name) })
      if (!res) continue
      modules.push(res)
    }
  }
  return modules
}

export async function resolveModules(params: ParseRouterParams) {
  const { moduleName, modulePath, ignore, parentModule, logger } = params
  const filename = basename(modulePath)
  if (ignore.some(r => r.test(filename))) return false

  const files: AppSpecialModuleFile[] = []
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

  const specialModule: AppSpecialModule = {
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
      ignore,
      parentModule: specialModule,
      logger
    })
  }

  return specialModule
}

type BuildRouteParams = {
  filename: string
  files: AppSpecialModuleFile[]
  parentModule: AppSpecialModule | null
}

function buildRoute({ filename, files, parentModule }: BuildRouteParams) {
  const { _page: pageFile, _router: routerFile, _action: actionFile } = findLegalEntries(files)
  if (!pageFile) return false

  let routePath = ""
  if (!parentModule && filename.toLocaleLowerCase() === "home") routePath = "/"
  else if (!parentModule && filename.toLocaleLowerCase() === "error") routePath = "/*"
  else {
    const index = pageFile.filename.lastIndexOf(".page")
    routePath = "/" + pageFile.filename.slice(0, index)
  }

  return { pageFile, routerFile, actionFile, routePath }
}

function findLegalEntries(files: AppSpecialModuleFile[]) {
  const specialSuffixes = ["page", "router", "action"]
  const result: Record<string, null | AppSpecialModuleFile> = { _page: null, _router: null, _action: null }
  for (const file of files) {
    for (const suffix of specialSuffixes) {
      const { appName } = file
      if (appName === suffix || appName.endsWith("." + suffix)) result["_" + suffix] = file
    }
  }
  return result
}
