import { Injectable } from "@nestjs/common"
import { AlbumSSRRenderOptions, CtrlOptions } from "./ssr.type.js"

@Injectable()
export class SSRService {
  createSSRRenderOptions(opts: CtrlOptions): AlbumSSRRenderOptions {
    throw "未初始化的 album builtin createSSRRenderOptions"
  }
}
