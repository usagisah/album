import EventEmitter from "events"
import { ServerMode } from "../cli/cli.type.js"
import { ClientManager } from "../client/client.type.js"
import { ServerManager } from "../server/server.type.js"
import { SSRComposeDevConfig } from "../ssrCompose/ssrCompose.type.js"
import { NodeArgs } from "../utils/command/args.js"
import { DirStruct } from "../utils/fs/fileManager.js"
import { DevOutputs } from "./context.type.js"
import { Env } from "./env/env.type.js"
import { DevInputs } from "./inputs/inputs.type.js"
import { AlbumUserPlugin } from "./plugins/plugin.type.js"
import { ServerConfig } from "./server/serverConfig.type.js"
import { AlbumUserConfig } from "./userConfig/userConfig.type.js"
import { FSWatcher } from "chokidar"

export * from "./client/clientConfig.type.js"
export * from "./env/env.type.js"
export * from "./inputs/inputs.type.js"
export * from "./outputs/outputs.type.js"
export * from "./plugins/plugin.type.js"
export * from "./server/serverConfig.type.js"
export * from "./ssrCompose/ssrCompose.type.js"
export * from "./userConfig/userConfig.type.js"

export type Mode = "development" | "production"

export type AlbumStaticInfo = {
  ssr: boolean
  mode: Mode
  serverMode: ServerMode
  inputs: DevInputs
  outputs: DevOutputs
  env: Env
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

export type AlbumDevContext = {
  info: AlbumStaticInfo
  watcher: FSWatcher
  plugin: {
    events: EventEmitter
    plugins: AlbumUserPlugin[]
  }

  appFileManager: DirStruct
  dumpFileManager: DirStruct

  clientConfig: ClientConfig
  serverConfig: ServerConfig
  ssrComposeConfig: SSRComposeDevConfig
  userConfig: AlbumUserConfig

  clientManager: ClientManager | null
  serverManager: ServerManager | null
  ssrComposeManager: null
}

export type CreateContextParams = {
  mode: Mode
  serverMode: ServerMode
  args: NodeArgs
}
