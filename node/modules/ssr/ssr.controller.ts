import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { PluginOnSSREnterParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { SsrComposeController } from "../ssr-compose/ssr-compose.controller.js"
import type { AlbumSSRRenderOptions } from "./ssr.type.js"

@Controller()
export class SsrController {
  ssrRender: (options: AlbumSSRRenderOptions) => Promise<any>
  onSsrRenderError: any

  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Get("*")
  async ssr(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>) {
    const albumContext = await this.context.getContext()
    const { logger, plugins, configs } = albumContext
    const { result } = await callPluginWithCatch<PluginOnSSREnterParam>(
      plugins.hooks.onSSREnter,
      {
        context: new Map(),
        api: plugins.event,
        result: {
          ssrOptions: { req, res, headers: { ...headers } },
          context: {
            mode: albumContext.mode,
            serverMode: albumContext.serverMode,
            logger: logger,
            viteDevServer: albumContext.vite.viteDevServer,
            inputs: { ...albumContext.inputs },
            outputs: { ...albumContext.outputs },
            ssrCompose: configs.ssrCompose ? { ...configs.ssrCompose } : null,
            meta: {}
          }
        }
      },
      e => logger.error("PluginOnSSREnter", e, "album")
    )

    try {
      await this.ssrRender({
        context: result.context,
        ssrOptions: result.ssrOptions,
        ssrComposeOptions: configs.ssrCompose ? SsrComposeController.createSsrComposeOptions(albumContext) : null
      })
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
