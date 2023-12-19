import { Func } from "../utils/types/types.js"

export type ServerConfigRewrite = Func<[string, Record<string, string>, Request]>[]

export type StartServerConfig = {
  port: number
  rewrite: ServerConfigRewrite
}
