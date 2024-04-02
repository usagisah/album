import { isBlank } from "@albumjs/tools/node"
import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import { AlbumContext } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { AppManagerModule, AppSpecialModule, AppSpecialModuleDir, AppSpecialModuleFile } from "./app.dev.type.js"

export function buildSpecialModules(context: AlbumContext): Promise<AppSpecialModule[][]> {
  const { ssrCompose, appManager, logger } = context
  const { modules } = appManager
  return Promise.all(
    modules.map(async module => {
      if (isBlank(module.modulePath)) {
        throw "make-special-module 发现约定式模块入口为空"
      }
      return await walkModules({ logger, parentModule: null, ...module })
    })
  )
  // if (ssrCompose) {
  //   const res = await resolveModules({ logger, parentModule: null, ...module })
  //   return res ? [res] : []
  // }
}

type ParseRouterParams = AppManagerModule & {
  parentModule: AppSpecialModule | null
  logger: ILogger
}

export async function walkModules(params: ParseRouterParams) {
  const { modulePath } = params
  const modules: AppSpecialModule[] = []
  const ms = await readdir(modulePath, { withFileTypes: true })
  await Promise.all(
    ms.map(async m => {
      if (m.isDirectory()) {
        const res = await resolveModules({ ...params, modulePath: resolve(modulePath, m.name) })
        if (!res) {
          return
        }
        modules.push(res)
      }
    })
  )
  return modules
}

export async function resolveDirFiles(params: { findChildModule: boolean; moduleName: string; modulePath: string; fileExtensions: RegExp[] }) {
  const { findChildModule, moduleName, modulePath, fileExtensions } = params
  const files: AppSpecialModuleFile[] = []
  const dirs: AppSpecialModuleDir[] = []
  let childModuleDir: Dirent | null = null

  const dirFiles = await readdir(modulePath, { encoding: "utf-8", withFileTypes: true })
  await Promise.all(
    dirFiles.map(async file => {
      const filename = file.name
      const filepath = resolve(modulePath, file.name)

      if (file.isDirectory()) {
        if (findChildModule && filename === moduleName) {
          childModuleDir = file
        } else {
          const dir = await resolveDirFiles({
            findChildModule: false,
            moduleName,
            modulePath: resolve(modulePath, childModuleDir.name),
            fileExtensions
          })
          dirs.push({ type: "dir", filename, filepath, files: dir.files, dirs: dir.dirs })
        }
        return
      }

      const { name, ext } = pathParse(filename)
      if (fileExtensions.some(t => t.test(filename))) {
        files.push({
          type: "file",
          filepath,
          filename,
          // xxx.page. 这是不合法的
          appName: ext.length <= 1 ? filename : name,
          ext: ext.slice(1)
        })
      }
    })
  )
  return { files, dirs, childModuleDir }
}

export async function resolveModules(params: ParseRouterParams) {
  const { moduleName, modulePath, fileExtensions, ignore, logger, ...ps } = params

  const filename = basename(modulePath)
  if (ignore.some(r => r.test(filename))) {
    return false
  }

  const { files, dirs, childModuleDir } = await resolveDirFiles({ findChildModule: true, moduleName, modulePath, fileExtensions })
  const res = buildRoute({ filename, files }, params)
  if (!res) {
    return
  }

  const specialModule: AppSpecialModule = {
    type: "module",
    filename,
    filepath: modulePath,
    files,
    dirs,
    children: [],
    ...res
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
  const pageFile = files.find(f => pageFilter.test(f.appName))
  if (!pageFile) {
    return false
  }

  const routerFile = files.find(f => routerFilter.test(f.appName))
  let routePath = ""
  if (!parentModule && filename.toLocaleLowerCase() === "home") {
    routePath = "/"
  } else if (!parentModule && filename.toLocaleLowerCase() === "error") {
    routePath = "/*"
  } else {
    const index = pageFile.filename.lastIndexOf(".page")
    routePath = "/" + pageFile.filename.slice(0, index)
  }

  const actionFile = files.find(f => actionFilter.test(f.appName))
  return { pageFile, routerFile, actionFile, routePath }
}
