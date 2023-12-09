export type ClientConfigModule = {
  moduleName: string
  modulePath: string
  ignore: RegExp[]
}

export type ClientConfigRouter = {
  basename: string
}

export type ClientConfig = {
  mainInput: string
  mainSSRInput: string | null
  module: ClientConfigModule
  router: ClientConfigRouter
}

export type StartClientConfig = {
  router: {
    basename: string
  }
}
