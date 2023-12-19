import {} from "./context.dev.type.js"

export type Inputs = {
  cwd: string
  root: string | null
  clientInput: string | null
  ssrInput: string | null
  mainSSRInput: string | null
  apiAppInput: string | null
}

export type AlbumContext = {
  info: AlbumStartStaticInfo
  logger: ILogger

  clientConfig: StartClientConfig
  serverConfig: StartServerConfig
  ssrComposeConfig: SSRComposeStartConfig
  userConfig: StartCacheUserConfig
}

export type AlbumStartStaticInfo = {
  serverMode: "start"
  ssr: boolean
  ssrCompose: boolean
  inputs: StartInputs
  env: Env
}
