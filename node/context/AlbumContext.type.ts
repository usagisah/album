import type { ClientManager } from "../client/client.type.js"
import type { ServerManager } from "../server/server.type.js"
import type { DirStruct } from "../utils/utils.js"
import type { ClientConfig, Env, ServerConfig } from "./AlbumContext.type.js"
import { SSRCompose } from "./types/ssrCompose.type.js"
import { UserConfig } from "./types/userConfig.type.js"

export type { AlbumContext } from "./AlbumContext.js"
export type * from "./types/clientConfig.type.js"
export type * from "./types/env.type.js"
export type * from "./types/plugins.type.js"
export type * from "./types/serverConfig.type.js"
export type * from "./types/ssrCompose.type.js"
export type * from "./types/userConfig.type.js"

export type AppMode = "development" | "production"

export type AppStatus = {
  ssr: boolean
  env: Env
}

export type AppInputs = {
  cwd: string
  dumpInput: string
  clientInput: string
  realClientInput: string
  ssrInput: string
  realSSRInput: string
  realSSRComposeInput: string | null
}

export type AppOutputs = {
  clientOutDir: string
  ssrOutDir: string
}

export type AppConfigs = {
  clientConfig: ClientConfig
  serverConfig: ServerConfig
  userConfig: UserConfig
  ssrCompose: null | SSRCompose
}

export type AppManager = {
  fileManager: DirStruct
  clientManager: ClientManager
  serverManager: ServerManager
}
