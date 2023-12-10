export type ClientConfigModule = {
  moduleName: string
  modulePath: string
  ignore: RegExp[]
}

export type ClientConfigRouter = {
  basename: string
}

export type ClientConfigSSRRender = {
  sendMode: "pipe" | "string"
}

export type ClientConfig = {
  mainInput: string
  mainSSRInput: string | null
  ssrRender: ClientConfigSSRRender
  module: ClientConfigModule
  router: ClientConfigRouter
}

export type StartClientConfig = {
  ssrRender: ClientConfigSSRRender
}
