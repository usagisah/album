import { FSWatcher } from "chokidar"
import EventEmitter from "events"
import { ViteDevServer } from "vite"
import { ServerMode } from "../cli/cli.type.js"
import { ClientManager } from "../client/client.type.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { SSRComposeDevConfig, SSRComposeStartConfig } from "../ssrCompose/ssrCompose.type.js"
import { NodeArgs } from "../utils/command/args.js"
import { DirStruct } from "../utils/fs/fileManager.js"
import { ClientConfig } from "./client/clientConfig.type.js"
import { Env } from "./env/env.type.js"
import { DevInputs, StartInputs } from "./inputs/inputs.type.js"
import { DevOutputs } from "./outputs/outputs.type.js"
import { AlbumUserPlugin } from "./plugins/plugin.type.js"
import { ServerConfig } from "./server/serverConfig.type.js"
import { AlbumUserConfig, StartCacheUserConfig } from "./userConfig/userConfig.type.js"

export { FSWatcher } from "chokidar"
export * from "./client/clientConfig.type.js"
export * from "./env/env.type.js"
export * from "./inputs/inputs.type.js"
export * from "./outputs/outputs.type.js"
export * from "./plugins/plugin.type.js"
export * from "./server/serverConfig.type.js"
export * from "./userConfig/userConfig.type.js"

export type CreateContextParams = {
  appId: string
  mode: Mode
  serverMode: ServerMode
  args: NodeArgs
}

export type Mode = "development" | "production"

export type PluginConfig = {
  events: EventEmitter
  plugins: AlbumUserPlugin[]
}

export type AlbumDevStaticInfo = {
  serverMode: ServerMode
  appId: string
  mode: Mode
  ssr: boolean
  ssrCompose: boolean
  inputs: DevInputs
  outputs: DevOutputs
  env: Env
}

export type AlbumDevContext = {
  info: AlbumDevStaticInfo
  logger: ILogger
  watcher: FSWatcher

  appFileManager: DirStruct
  dumpFileManager: DirStruct

  pluginConfig: PluginConfig
  clientConfig: ClientConfig
  serverConfig: ServerConfig
  ssrComposeConfig: SSRComposeDevConfig | null
  userConfig: AlbumUserConfig

  clientManager: ClientManager | null
  viteDevServer: ViteDevServer | null
}

export type AlbumStartStaticInfo = {
  serverMode: "start"
  mode: Mode
  ssr: boolean
  ssrCompose: boolean
  inputs: StartInputs
  env: Env
}

export type AlbumStartContext = {
  info: AlbumStartStaticInfo
  logger: ILogger

  serverConfig: ServerConfig
  ssrComposeConfig: SSRComposeStartConfig
  userConfig: StartCacheUserConfig
}
