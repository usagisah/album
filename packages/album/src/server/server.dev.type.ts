import { Obj } from "@albumjs/tools/node"

export type ServerManagerAppModule = {
  filename: string
  input: string | null
  output: string | null
}

export type ServerManagerTsconfig = Obj | null

export type ServerManager = {
  port: number
  appModule: ServerManagerAppModule
  builtinModules: boolean
  tsconfig: ServerManagerTsconfig
}
