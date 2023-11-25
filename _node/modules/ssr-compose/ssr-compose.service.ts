import { Injectable } from "@nestjs/common"
import { SSRComposeContext } from "./ssr-compose.type.js"

@Injectable()
export class SSRComposeService {
  createSSRComposeContext(): SSRComposeContext {
    throw "未初始化的 album builtin createSSRComposeContext"
  }
}
