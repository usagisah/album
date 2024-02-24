import { Request, Response } from "express"
import { Env } from "../../env/env.type.js"
import { ILogger } from "../../logger/logger.type.js"
import { ServerMode } from "../../service/service.type.js"
import { AlbumSSRComposeContext } from "../ssr-compose/ssr-compose.type.js"

export type AlbumSSRServerData = Record<string, any>
export type AlbumSSRServerDynamicData = Record<string, Record<string, any>>

export type AlbumSSRInputs = {
  cwd: string
  root: string
  clientEntryInput: string | null
}

export type AlbumSSRContext = {
  // 上下文静态信息
  serverMode: ServerMode
  ssr: boolean
  ssrCompose: boolean
  env: Env
  inputs: AlbumSSRInputs
  ssrRender: {
    sendMode: "pipe" | "string"
  }
  logger: ILogger

  // 请求相关数据
  query: Record<string, any>
  params: Record<string, string>
  req: Request
  res: Response
  headers: Record<string, string>
  albumOptions: {
    pathname: string
    originalPathname: string
    prefix: string
    url: string
  }

  // 由插件负责的数据
  serverRouteData: AlbumSSRServerData
  serverDynamicData: AlbumSSRServerDynamicData
}

export type AlbumSSRRenderOptions = {
  ssrContext: AlbumSSRContext
  getSSRProps: () => Record<any, any>
  ssrComposeContext: AlbumSSRComposeContext | null
}

export type CtrlOptions = {
  req: Request
  res: Response
  headers: Record<string, string>
}
