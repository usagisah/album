import { Request } from "express"

declare module "express" {
  export interface Request {
    albumOptions: {
      pathname: string
      prefix: string
    }
  }
}