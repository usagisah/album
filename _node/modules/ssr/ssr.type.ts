import { Request, Response } from "express"
import { ServerMode } from "../../cli/cli.type.js"
import { Env, Mode } from "../../context/context.type.js"
import { ILogger } from "../logger/logger.type.js"
import { SSRComposeContext } from "../ssr-compose/ssr-compose.type.js"

export type AlbumSSRServerData = Record<string, any>
export type AlbumSSRServerDynamicData = Record<string, Record<string, any>>

export type AlbumSSRInputs = {
  cwd: string
  root: string
  clientEntryInput: string | null
}

export type AlbumSSRContext = {
  // 上下文静态信息
  mode: Mode
  serverMode: ServerMode
  ssr: boolean
  ssrCompose: boolean
  env: Env
  inputs: AlbumSSRInputs
  logger: ILogger

  // 请求相关数据
  query: Record<string, any>
  params: Record<string, string>
  req: Request
  res: Response
  headers: Record<string, string>
  albumOptions: {
    pathname: string
    prefix: string
  }

  // 由插件负责的数据
  serverRouteData: AlbumSSRServerData
  serverDynamicData: AlbumSSRServerDynamicData
}

export type AlbumSSRRenderOptions = {
  ssrContext: AlbumSSRContext
  ssrComposeContext: SSRComposeContext | null
}

export type CtrlOptions = {
  req: Request
  res: Response
  headers: Record<string, string>
}
