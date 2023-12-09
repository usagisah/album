import { Injectable } from "@nestjs/common"
import { AlbumContext } from "../../context/context.type.js"
import { AlbumSSRComposeContext } from "../ssr-compose/ssr-compose.type.js"
import { AlbumSSRRenderOptions, CtrlOptions } from "../ssr/ssr.type.js"

@Injectable()
export class AlbumContextService {
  getContext(): AlbumContext {
    throw "未初始化的 album builtin getContext"
  }

  createSSRRenderOptions(opts: CtrlOptions): AlbumSSRRenderOptions {
    throw "未初始化的 album builtin createSSRRenderOptions"
  }

  createSSRComposeContext(): AlbumSSRComposeContext {
    throw "未初始化的 album builtin createSSRComposeContext"
  }
}

export function createAlbumServer(ctx: AlbumContext) {
  AlbumContextService.prototype.getContext = () => ctx
  return AlbumContextService
}
