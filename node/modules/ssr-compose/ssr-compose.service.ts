import { Injectable } from "@nestjs/common"
import { AlbumSSRComposeContext } from "./ssr-compose.type.js"

@Injectable()
export class SSRComposeService {
  createSSRComposeContext(): AlbumSSRComposeContext {
    throw "未初始化的 album builtin createSSRComposeContext"
  }
}
