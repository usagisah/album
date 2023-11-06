export type SpecialModuleFile = {
  type: "file"
  filepath: string
  filename: string
  appName: string
  ext: string
}

export type SpecialModule = {
  type: "module"
  filepath: string
  filename: string
  files: SpecialModuleFile[]
  children: SpecialModule[]

  pageFile: SpecialModuleFile
  routerFile: SpecialModuleFile | null
  actionFile: SpecialModuleFile | null
  routePath: string
}

export type ClientManager = {
  specialModules: SpecialModule[]
  realClientInput: string
  realSSRInput: string | null
}
