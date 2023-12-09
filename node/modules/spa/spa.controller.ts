import { Controller, Get, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { sep } from "path"
import { AlbumDevContext } from "../../context/context.type.js"
import { AlbumContextService } from "../context/album-context.service.js"

@Controller()
export class SpaController {
  constructor(private context: AlbumContextService) {}

  @Get("*")
  async spa(@Req() req: Request, @Res() res: Response) {
    console.log("????")
    const { url, originalUrl } = req
    const { info, viteDevServer } = this.context.getContext() as AlbumDevContext
    const { inputs } = info
    const htmlPath = inputs.cwd + sep + "index.html"
    if (!existsSync(htmlPath)) return res.send("index.html 不存在")
    let html = await readFile(inputs.cwd + sep + "index.html", "utf-8")
    html = await viteDevServer!.transformIndexHtml(url, html, originalUrl)
    res.send(html)
  }
}
