import { FSWatcher } from "chokidar"
import EventEmitter from "events"
import { ViteDevServer } from "vite"
import { ServerMode } from "../cli/cli.type.js"
import { ClientManager } from "../client/client.type.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { AlbumUserPlugin } from "../plugins/plugin.type.js"
import { SSRComposeDevConfig, SSRComposeStartConfig } from "../ssrCompose/ssrCompose.type.js"
import { NodeArgs } from "../utils/command/args.js"
import { DirStruct } from "../utils/fs/fileManager.js"
import { ClientConfig, StartClientConfig } from "./client/clientConfig.type.js"
import { Env } from "./env/env.type.js"
import { DevInputs, StartInputs } from "./inputs/inputs.type.js"
import { DevOutputs } from "./outputs/outputs.type.js"
import { DevServerConfig, StartServerConfig } from "./server/serverConfig.type.js"
import { AlbumUserConfig, StartCacheUserConfig } from "./userConfig/userConfig.type.js"

export { FSWatcher } from "chokidar"
export * from "./client/clientConfig.type.js"
export * from "./env/env.type.js"
export * from "./inputs/inputs.type.js"
export * from "./outputs/outputs.type.js"
export * from "./server/serverConfig.type.js"
export * from "./userConfig/userConfig.type.js"

export type CreateContextParams = {
  appId: string
  serverMode: ServerMode
  args: NodeArgs
}

export type ContextPluginConfig = {
  events: EventEmitter
  plugins: AlbumUserPlugin[]
}

export type AlbumDevStaticInfo = {
  serverMode: ServerMode
  appId: string
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

  pluginConfig: ContextPluginConfig
  clientConfig: ClientConfig
  serverConfig: DevServerConfig
  ssrComposeConfig: SSRComposeDevConfig | null
  userConfig: AlbumUserConfig

  clientManager: ClientManager | null
  viteDevServer: ViteDevServer | null
}

export type AlbumStartStaticInfo = {
  serverMode: "start"
  ssr: boolean
  ssrCompose: boolean
  inputs: StartInputs
  env: Env
}

export type AlbumStartContext = {
  info: AlbumStartStaticInfo
  logger: ILogger

  clientConfig: StartClientConfig
  serverConfig: StartServerConfig
  ssrComposeConfig: SSRComposeStartConfig
  userConfig: StartCacheUserConfig
}

export type AlbumContext = AlbumDevContext | AlbumStartContext
