import { ServerMode } from "../cli/cli.type.js"
import { ClientManager } from "../client/client.type.js"
import { ServerManager } from "../server/server.type.js"
import { NodeArgs } from "../utils/command/args.js"
import { DirStruct } from "../utils/fs/fileManager.js"
import { Env } from "./env/env.type.js"
import { DevInputs } from "./inputs/inputs.type.js"
import { Plugins } from "./plugins/plugin.type.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"

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
  plugins: Plugins

  userConfig: AlbumUserConfig
  clientConfig: ClientConfig
  serverConfig: ServerConfig

  fileManager: DirStruct
  clientManager: ClientManager
  serverManager: ServerManager
}

export type CreateContextParams = {
  mode: Mode
  serverMode: ServerMode
  args: NodeArgs
}
