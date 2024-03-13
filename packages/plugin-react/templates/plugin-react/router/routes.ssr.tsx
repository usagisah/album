export type ServerRoute = {
  name: string
  reg: RegExp
  fullPath: string
  actionPath: string | null
  actionFactory: (() => Promise<unknown>) | null
}

export const serverRoutes: ServerRoute[] = ["__ref__serverRoutes"]

export type RedirectRoute = {
  from: string
  to: string
}
export const redirectRoutes: RedirectRoute[] = ["__ref__redirectRoutes"]
