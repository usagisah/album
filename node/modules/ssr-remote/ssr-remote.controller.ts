import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { existsSync } from "fs"
import { resolve } from "path"
import { isPlainObject } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { SSRRemoteStruct } from "./ssr-remote.struct.js"

@Controller()
export class SsrRemoteController {
  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() props: any) {
    const describe = headers["album-remote-source"]
    if (!describe) {
      return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })
    }

    debugger
    const [name] = describe.split(";")
    if (!name) return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })

    const struct = this.resolveSSRRemoteStruct(props, name)
    if (struct === false) return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })

    const { mode, vite, configs } = await this.context.getContext()
    const { viteDevServer } = vite
    const cwd = resolve(configs.clientConfig.module.modulePath, "../")
    const filePath = resolve(cwd, name)
    if (!existsSync(filePath)) {
      return res.status(404).send({ reason: "ssr-remote 指定资源不存在" })
    }

    if (1) {
      return res.status(200).send("aa")
    }

    try {
      const entry = (await viteDevServer.ssrLoadModule(filePath)).default
      if (!entry) {
        return res.status(404).send({ reason: "ssr-remote 指定资源不存在" })
      }

      res.send("success")
    } catch (error) {
      return res.status(500).send({ reason: "服务器错误", error })
    }
  }

  resolveSSRRemoteStruct(value: unknown, name: string) {
    if (!isPlainObject(value)) {
      return false
    }

    if (!value.messages || !isPlainObject(value.messages)) {
      return false
    }

    if (!value.props || !isPlainObject(value.props)) {
      return false
    }

    return new SSRRemoteStruct(name, value.messages, value.props)
  }

  async initModule() {
    const { mode, vite } = await this.context.getContext()
    if (mode === "production") {
      return
    }
  }
}
