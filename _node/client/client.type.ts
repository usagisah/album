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
  router: SpecialModuleFile | null
  action: SpecialModuleFile | null
  routePath: string
  routeFilePath: string
  files: SpecialModuleFile[]
  children: SpecialModule[]
}

export type ClientManager = {
  specialModules: SpecialModule[]
}
