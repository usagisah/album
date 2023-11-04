import { ServerMode } from "../cli/cli.type.js"
import { ClientManager } from "../client/client.type.js"
import { ServerManager } from "../server/server.type.js"
import { NodeArgs } from "../utils/command/args.js"
import { DirStruct } from "../utils/fs/fileManager.js"
import { Env } from "./env/env.type.js"
import { DevInputs } from "./inputs/inputs.type.js"
import { AlbumUserPlugin } from "./plugins/plugin.type.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"

export * from "./env/env.type.js"
export * from "./inputs/inputs.type.js"
export * from "./outputs/outputs.type.js"
export * from "./plugins/plugin.type.js"
export * from "./userConfig/userConfig.type.js"
export * from "./ssrCompose/ssrCompose.type.js"

export type Mode = "development" | "production"

export type AlbumStaticInfo = {
  ssr: boolean
}

export type ClientConfigModule = {
  moduleName: string
  modulePath: string
}

export type ClientConfigRouter = {
  basename: string
}

export type ClientConfig = {
  main: string
  mainSSR: string | null
  module: ClientConfigModule
  router: ClientConfigRouter
}

export type ServerConfig = {
  port: number
}

export type AlbumDevContext = {
  mode: Mode
  inputs: DevInputs
  env: Env
  info: AlbumStaticInfo
  plugins: AlbumUserPlugin[]

  userConfig: AlbumUserConfig
  clientConfig: ClientConfig
  serverConfig: ServerConfig

  fileManager: DirStruct
  clientManager: ClientManager | null
  serverManager: ServerManager | null
}

export type CreateContextParams = {
  mode: Mode
  serverMode: ServerMode
  args: NodeArgs
}
