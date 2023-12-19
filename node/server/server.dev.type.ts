import { Func, Obj } from "../utils/types/types.js"

export type ServerManagerAppModule = {
  filename: string
  input: string | null
  output: string | null
}

export type ServerManagerRewrite = Func<[string, Record<string, string>, Request]>[]

export type ServerManagerTsconfig = Obj | null

export type ServerManager = {
  port: number
  rewrite: ServerManagerRewrite
  appModule: ServerManagerAppModule
  tsconfig: ServerManagerTsconfig
}
