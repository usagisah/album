import { Controller, Get, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { readFile } from "fs/promises"
import { relative, resolve } from "path"
import { AlbumContext as DevContext } from "../../context/context.dev.type.js"
import { AlbumContext as StartContext } from "../../context/context.start.type.js"
import { AlbumContextService } from "../context/album-context.service.js"

@Controller()
export class SpaController {
  indexHtml: string
  spaRender: (req: Request, res: Response) => Promise<any>

  constructor(private context: AlbumContextService) {
    const { serverMode } = this.context.getContext()
    if (serverMode === "start") {
      this.spaRender = this.startSpaRender
    } else {
      this.spaRender = this.devSpaRender
    }
  }

  @Get("*")
  async spa(@Req() req: Request, @Res() res: Response) {
    await this.spaRender(req, res)
  }

  async devSpaRender(req: Request, res: Response) {
    const { url, originalUrl } = req
    const { inputs, appManager, viteDevServer } = this.context.getContext() as DevContext
    try {
      let html = await readFile(resolve(inputs.cwd, "index.html"), "utf-8")
      html = html.replace("</body>", `<script type="module" src="/${relative(inputs.cwd, appManager.realClientInput)}"></script></body>`)
      html = await viteDevServer!.transformIndexHtml(url, html, originalUrl)
      res.send(html)
    } catch (e) {
      return res.status(404).send()
    }
  }

  async startSpaRender(req: Request, res: Response) {
    const { inputs } = this.context.getContext() as StartContext
    if (!this.indexHtml) {
      this.indexHtml = await readFile(resolve(inputs.root, "index.html"), "utf-8")
    }
    res.send(this.indexHtml)
  }
}
