import { Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"

@Controller()
export class SsrRemoteController {
  constructor() {}

  @Post("*")
  async ssrRemoteEntry(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    const describe = headers["album-remote-source"]
    if (!describe) {
      return res.status(404).send({ msg: "fail" })
    }

    console.log( req.body, req.url, req.query )
    return res.status(200).send({ a: "aaaaaaaaaaa" })
  }
}

type SourceMap = {
  type: "root" | "children"
  props: Record<string, any>
  messages: Record<string, any>
  sources: Record<string, {
    sourcePath: string
    sourceValue: string
    preloads: string[]
    meta: Record<string, any>
  }>
}