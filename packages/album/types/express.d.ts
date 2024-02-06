import "express"

declare module "express" {
  export interface Request {
    albumOptions: {
      pathname: string
      originalPathname: string
      prefix: string
      url: string
    }
  }
}
