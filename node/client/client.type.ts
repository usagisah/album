export type SpecialModuleFile = {
  type: "file"
  filePath: string
  fileName: string
  fullName: string
  fileExt: string
}

export type SpecialModule = {
  type: "module"
  filePath: string
  fileName: string
  page: SpecialModuleFile
  router?: SpecialModuleFile
  action?: SpecialModuleFile
  routePath: string
  routeFilePath: string
  files: SpecialModuleFile[]
  children: SpecialModule[]
  meta: Map<string, any>
}

export type ClientManager = {
  specialModules: SpecialModule[]
}