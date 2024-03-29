import { Obj } from "@albumjs/tools/node"

export type AppManagerModule = {
  moduleName: string
  modulePath: string
  ignore: RegExp[]
  pageFilter: RegExp
  routerFilter: RegExp
  actionFilter: RegExp
  fileExtensions: RegExp[]
}

export type AppManagerRouter = {
  basename: string
  redirect: Obj<string>
}

export type AppManagerSSRRender = {
  sendMode: "pipe" | "string"
}

export type AppManager = {
  mainInput: string
  mainSSRInput: string | null
  ssrRender: AppManagerSSRRender
  module: AppManagerModule
  router: AppManagerRouter

  specialModules: AppSpecialModule[]
  realClientInput: string
  realSSRInput: string
}

export type AppSpecialModuleFile = {
  type: "file"
  filepath: string
  filename: string
  appName: string
  ext: string
}

export type AppSpecialModuleDir = {
  type: "dir"
  filepath: string
  filename: string
  files: AppSpecialModuleFile[]
  dirs: AppSpecialModuleDir[]
}

export type AppSpecialModule = {
  type: "module"
  filepath: string
  filename: string
  files: AppSpecialModuleFile[]
  dirs: AppSpecialModuleDir[]
  children: AppSpecialModule[]

  pageFile: AppSpecialModuleFile
  routerFile: AppSpecialModuleFile | null
  actionFile: AppSpecialModuleFile | null
  routePath: string
}
