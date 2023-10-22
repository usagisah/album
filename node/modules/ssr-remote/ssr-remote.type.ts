import type { Request } from "express"
import type { ViteDevServer, UserConfig as ViteUserConfig } from "vite"
import type { AlBumServerMode } from "../../cli/cli.type.js"
import type { AppInputs, AppMode, AppOutputs } from "../../context/AlbumContext.type.js"
import type { ILogger } from "../logger/logger.type.js"

export type SSRRemoteType = "root" | "children"
export type SSRRemoteProps = Record<string, any>
export type SSRRemoteMessages = Record<string, any>
export type SSRRemoteSources = Record<
  string,
  {
    sourcePath: string
    sourceValue: string
    preloads: string[]
    meta: Record<string, any>
  }
>
export type SSRRemoteStruct = {
  type: SSRRemoteType
  props: SSRRemoteProps
  messages: SSRRemoteMessages
  sources: SSRRemoteSources
}

export type AlbumSSRRemoteContext = {
  mode: AppMode
  serverMode: AlBumServerMode
  logger: ILogger
  viteDevServer: ViteDevServer
  createViteConfig: any
  inputs: AppInputs
  outputs: AppOutputs
}

export type AlbumSSRRemoteOptions = {
  req: Request
  headers: Record<string, string>
  filePath: string
  sourcePath: string
  ssrRemoteStruct: SSRRemoteStruct
}
