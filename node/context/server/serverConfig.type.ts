import { Request } from "express"
import { Func } from "../../utils/types/types.js"

export type ServerConfig = {
  port: number
  rewrite: Func<[string, Record<string, string>, Request]>[]
}
