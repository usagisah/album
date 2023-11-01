import { Request, Response } from "express"
import { AlBumServerMode } from "../../cli/cli.type.js"
import { AlbumContext, AppInputs, AppMode } from "../../context/AlbumContext.type.js"
import { ILogger } from "../logger/logger.type.js"
import { SSRComposeOptions } from "../ssr-compose/ssr-compose.type.js"

export type CtlOptions = {
  req: Request
  res: Response
  headers: Record<string, string>
}

export type ServerDynamicData = Record<string, Record<string, any>>

export type AlbumSSRContextOptions = {
  ssrSlideProps: {
    req: Request
    headers: Record<string, string>
    mode: AppMode
    serverMode: AlBumServerMode
    logger: ILogger
    inputs: AppInputs
    query: Record<string, any>
    params: Record<string, string>
  }
  serverRouteData: Record<string, any>
  serverDynamicData: ServerDynamicData
}

export type AlbumSSRRenderOptions = {
  ctlOptions: CtlOptions
  serverContext: AlbumContext
  ssrContextOptions: AlbumSSRContextOptions
  ssrComposeOptions: SSRComposeOptions | null
}
