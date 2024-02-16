import "express"

declare module "express" {
  export interface Request {
    albumOptions: {
      prefix: string
      pathname: string
      url: string
      originalPathname: string
      originalUrl: string
    }
  }
}
