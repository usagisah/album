import { readdir } from "fs/promises"
import { basename, parse as pathParse, resolve } from "path"
import { ILogger } from "../../logger/logger.type.js"
import { AppManagerModule, AppSpecialModule, AppSpecialModuleFile } from "../app.dev.type.js"

type ParseRouterParams = AppManagerModule & {
  logger: ILogger
  modules?: AppSpecialModule[]
  parentModule?: AppSpecialModule
  root?: boolean
  isFile?: boolean
  parentRoutePath?: string
}

export async function walkFlatModules(params: ParseRouterParams) {
  const { modulePath, modules = [] } = params
  const ms = await readdir(modulePath, { withFileTypes: true })
  await Promise.all(
    ms.map(async m => {
      return resolveModules({
        ...params,
        root: true,
        isFile: m.isFile(),
        modulePath: resolve(modulePath, m.name),
        modules
      })
    })
  )
  return modules
}

export async function resolveModules(params: ParseRouterParams) {
  const { root, isFile, modulePath, pageFilter, fileExtensions, ignore, modules, parentRoutePath = "" } = params

  const filename = basename(modulePath)
  if (ignore.some(r => r.test(filename))) {
    return false
  }

  if (!isFile) {
    await walkFlatModules({ ...params, root: false, parentRoutePath: parentRoutePath + "/" + filename })
  }

  const fileInfo = pathParse(filename)
  if (!pageFilter.test(filename) || !fileExtensions.some(t => t.test(filename))) {
    return false
  }

  const appName = fileInfo.ext.length <= 1 ? filename : fileInfo.name
  let routePath = ""
  if (root && appName.toLocaleLowerCase() === "home") {
    routePath = "/"
  } else if (root && appName.toLocaleLowerCase() === "error") {
    routePath = "/404"
  } else {
    routePath = parentRoutePath + "/" + (appName === "index" ? "" : appName)
  }

  const pageFile: AppSpecialModuleFile = {
    type: "file",
    filepath: modulePath,
    filename,
    appName,
    ext: fileInfo.ext.slice(1)
  }
  const specialModule: AppSpecialModule = {
    type: "module",
    filename,
    filepath: modulePath,
    files: [pageFile],
    dirs: [],
    children: [],
    pageFile,
    routerFile: null,
    actionFile: null,
    routePath
  }
  modules.push(specialModule)
}
