import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { PluginOnSSREnterParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import type { AlbumSSRRender } from "./ssr.type.js"

@Controller()
export class SsrController {
  ssrRender: AlbumSSRRender
  onSsrRenderError: any

  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Get("*")
  async ssr(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>) {
    const ctx = await this.context.getContext()
    const { logger, plugins } = ctx

    const { result } = await callPluginWithCatch<PluginOnSSREnterParam>(
      plugins.hooks.onSSREnter,
      {
        context: new Map(),
        api: plugins.event,
        result: {
          ssrOptions: { req, res, headers: { ...headers } },
          context: {
            mode: ctx.mode,
            serverMode: ctx.serverMode,
            logger: logger,
            viteDevServer: ctx.vite.viteDevServer,
            inputs: { ...ctx.inputs },
            outputs: { ...ctx.outputs },
            meta: {}
          }
        }
      },
      e => logger.error("PluginOnSSREnter", e, "album")
    )

    try {
      await this.ssrRender(result.ssrOptions, result.context)
    } catch (e: any) {
      res.status(500).send("服务器错误")
      this.onSsrRenderError(e)
      throw new Error(e, { cause: "ssr.controller" })
    }
  }

  async initModule() {
    const ctx = await this.context.getContext()
    const { viteDevServer } = ctx.vite
    const { realSSRInput } = ctx.inputs

    if (ctx.mode === "production") {
      this.ssrRender = (await import(realSSRInput)).default
      this.onSsrRenderError = () => {}
      return
    }

    if (ctx.mode === "development") {
      this.ssrRender = async (...params: any[]) => {
        return (await viteDevServer.ssrLoadModule(realSSRInput)).default(...params)
      }
      this.onSsrRenderError = (e: Error) => viteDevServer.ssrFixStacktrace(e)
      return
    }
  }
}
