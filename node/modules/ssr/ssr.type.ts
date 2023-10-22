import type { Request, Response } from "express"
import type { ViteDevServer } from "vite"
import type { AlBumServerMode } from "../../cli/cli.type.js"
import type { AppInputs, AppMode, AppOutputs } from "../../context/AlbumContext.type.js"
import type { ILogger } from "../logger/logger.type.js"

export type AlbumSSROptions = {
  req: Request
  res: Response
  headers: Record<string, string>
}

export type AlbumSSRContext = {
  mode: AppMode
  serverMode: AlBumServerMode
  logger: ILogger
  viteDevServer: ViteDevServer
  inputs: AppInputs
  outputs: AppOutputs
  meta: Record<any, any>
}

export type AlbumSSRRender = (ssrOptions: AlbumSSROptions, context: AlbumSSRContext) => Promise<any> | any
