import { Request } from "express"
import { Func, Obj } from "../../utils/types/types.js"

export type ServerConfigRewrite = Func<[string, Record<string, string>, Request]>[]

export type DevServerConfigAppModule = {
  filename: string
  input: string | null
  output: string | null
}

export type DevServerConfigTsconfig = Obj | null

export type DevServerConfig = {
  port: number
  rewrite: ServerConfigRewrite
  appModule: DevServerConfigAppModule
  tsconfig: DevServerConfigTsconfig
}

export type StartServerConfig = {
  port: number
  rewrite: ServerConfigRewrite
}
