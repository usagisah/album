import { isBlank } from "@albumjs/tools/node"
import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import { AlbumContext } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { AppManagerModule, AppSpecialModule, AppSpecialModuleFile } from "./app.dev.type.js"

export async function buildSpecialModules(context: AlbumContext): Promise<AppSpecialModule[]> {
  const { ssrCompose, appManager, logger } = context
  const { module } = appManager
  if (isBlank(module.modulePath)) {
    throw "make-special-module 发现约定式模块入口为空"
  }
  if (ssrCompose) {
    const res = await resolveModules({ logger, parentModule: null, ...module })
    return res ? [res] : []
  }
  return await walkModules({ logger, parentModule: null, ...module })
}

type ParseRouterParams = AppManagerModule & {
  parentModule: AppSpecialModule | null
  logger: ILogger
}

export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: AppSpecialModule[] = []
  for (const m of await readdir(modulePath, { withFileTypes: true })) {
    if (m.isDirectory()) {
      const res = await resolveModules({ ...params, modulePath: resolve(modulePath, m.name) })
      if (!res) {
        continue
      }
      modules.push(res)
    }
  }
  return modules
}

export async function resolveModules(params: ParseRouterParams) {
  const { moduleName, modulePath, fileExtensions, ignore, logger, ...ps } = params

  const filename = basename(modulePath)
  if (ignore.some(r => r.test(filename))) {
    return false
  }

  const files: AppSpecialModuleFile[] = []
  const dirFiles = await readdir(modulePath, { encoding: "utf-8", withFileTypes: true })
  let childModuleDir: Dirent | null = null
  for (const file of dirFiles) {
    const filename = file.name
    const filepath = resolve(modulePath, file.name)

    if (file.isDirectory()) {
      if (filename === moduleName) {
        childModuleDir = file
      }
      continue
    }

    const { name, ext } = pathParse(filename)
    if (fileExtensions.some(t => t.test(filename))) {
      files.push({
        type: "file",
        filepath,
        filename,
        // xxx.page. 这是不合法的
        appName: ext.length <= 1 ? filename : name,
        ext
      })
    }
  }

  const res = buildRoute({ filename, files }, params)
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
      ...ps,
      moduleName,
      modulePath: resolve(modulePath, childModuleDir.name),
      fileExtensions,
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
}

function buildRoute({ filename, files }: BuildRouteParams, { parentModule, pageFilter, actionFilter, routerFilter }: ParseRouterParams) {
  const pageFile = files.find(f => pageFilter.test(f.filename))
  if (!pageFile) {
    return false
  }

  const routerFile = files.find(f => routerFilter.test(f.filename))
  let routePath = ""
  if (!parentModule && filename.toLocaleLowerCase() === "home") {
    routePath = "/"
  } else if (!parentModule && filename.toLocaleLowerCase() === "error") {
    routePath = "/*"
  } else {
    const index = pageFile.filename.lastIndexOf(".page")
    routePath = "/" + pageFile.filename.slice(0, index)
  }

  const actionFile = files.find(f => actionFilter.test(f.filename))
  return { pageFile, routerFile, actionFile, routePath }
}
