import type { ServerConfig } from "./AlbumContext.type.js"
import type { ClientConfig } from "./AlbumContext.type.js"
import type { Env } from "./AlbumContext.type.js"
import type { DirStruct } from "../utils/utils.js"
import type { ClientManager } from "../client/client.type.js"
import type { ServerManager } from "../server/server.type.js"
import { UserConfig } from "./types/userConfig.type.js"
import { SSRCompose } from "./types/ssrCompose.type.js"

export type { AlbumContext } from "./AlbumContext.js"

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
}

export type AppOutputs = {
  clientOutDir: string
  ssrOutDir: string
}

export type AppConfigs = {
  clientConfig: ClientConfig
  serverConfig: ServerConfig
  userConfig: UserConfig
  ssrCompose: SSRCompose
}

export type AppManager = {
  fileManager: DirStruct
  clientManager: ClientManager
  serverManager: ServerManager
}

export * from "./types/plugins.type.js"

export * from "./types/env.type.js"

export * from "./types/clientConfig.type.js"

export * from "./types/serverConfig.type.js"

export * from "./types/userConfig.type.js"
