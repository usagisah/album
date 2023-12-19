import { FSWatcher } from "chokidar"
import { ViteDevServer } from "vite"
import { AppManager } from "../app/app.dev.type.js"
import { ServerMode } from "../cli/cli.type.js"
import { Env } from "../env/env.type.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { PluginManager } from "../plugins/plugin.dev.type.js"
import { ServerManager } from "../server/server.dev.type.js"
import { SSRComposeManager } from "../ssrCompose/ssrCompose.dev.type.js"
import { AlbumUserConfig } from "../user/user.dev.type.js"
import { DirStruct } from "../utils/fs/fileManager.js"

export type Inputs = {
  cwd: string
  root: string
  dumpInput: string
  albumConfigInput: string
}

export type Outputs = {
  baseOutDir: string
  outDir: string
  clientOutDir: string
  ssrOutDir: string
  apiOutDir: string
}

export type ContextStaticInfo = {
  appId: string
  serverMode: ServerMode
  ssr: boolean
  ssrCompose: boolean
  inputs: Inputs
  outputs: Outputs
  env: Env
}

export type AlbumContext = {
  appId: string
  serverMode: ServerMode
  ssr: boolean
  ssrCompose: boolean
  inputs: Inputs
  env: Env
  outputs: Outputs

  appFileManager: DirStruct
  dumpFileManager: DirStruct

  appManager: AppManager
  serverManager: ServerManager
  ssrComposeManager: SSRComposeManager | null

  pluginManager: PluginManager
  userConfig: AlbumUserConfig

  logger: ILogger
  watcher: FSWatcher
  viteDevServer: ViteDevServer

  getStaticInfo: () => ContextStaticInfo
}
