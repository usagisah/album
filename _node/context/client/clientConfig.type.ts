export type ClientConfigModule = {
  moduleName: string | null
  modulePath: string
}

export type ClientConfigRouter = {
  basename: string
}

export type ClientConfig = {
  mainInput: string
  mainSSRInput: string | null
  module: ClientConfigModule | null
  router: ClientConfigRouter
}
