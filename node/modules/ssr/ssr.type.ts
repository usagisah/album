import type { Request, Response } from "express"
import type { ViteDevServer } from "vite"
import type { AlBumServerMode } from "../../cli/cli.type.js"
import type { AppInputs, AppMode, AppOutputs, SSRCompose } from "../../context/AlbumContext.type.js"
import type { ILogger } from "../logger/logger.type.js"
import type { SSRComposeOptions } from "../ssr-compose/ssr-compose.type.js"

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
  ssrCompose: SSRCompose | null
  meta: Record<any, any>
}

export type ServerDynamicData = Record<string, Record<string, any>>

export type AlbumSSRContextProps = {
  ssrSlideProps: {
    req: Request
    headers: Record<string, string>
    mode: AppMode
    serverMode: AlBumServerMode
    logger: ILogger
    inputs: AppInputs
    outputs: AppOutputs
    meta: Record<any, any>
    query: Record<string, any>
    params: Record<string, string>
  }
  serverRouteData: Record<string, any>
  serverDynamicData: ServerDynamicData
}

export type AlbumSSRRenderOptions = {
  ssrOptions: AlbumSSROptions
  ssrComposeOptions: SSRComposeOptions | null
  context: AlbumSSRContext
}
