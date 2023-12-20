import { Obj } from "../utils/types/types.js"

export type ServerManagerAppModule = {
  filename: string
  input: string | null
  output: string | null
}

export type ServerManagerTsconfig = Obj | null

export type ServerManager = {
  port: number
  appModule: ServerManagerAppModule
  tsconfig: ServerManagerTsconfig
}
