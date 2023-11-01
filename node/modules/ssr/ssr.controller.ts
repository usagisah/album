import { Request, Response } from "express"
import { AlbumContext } from "../../context/AlbumContext.type.js"
import { AlbumSSRContextOptions, AlbumSSRRenderOptions, CtlOptions } from "./ssr.type.js"

import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import { AlbumContextService } from "../context/album-context.service.js"
import { createSsrComposeOptions } from "../ssr-compose/ssr-compose.controller.js"

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
    const { ssrCompose } = albumContext.configs

    try {
      const ctlOptions = { req, res, headers }
      await this.ssrRender({
        serverContext: albumContext,
        ctlOptions,
        ssrContextOptions: createSsrContextOptions(ctlOptions, albumContext),
        ssrComposeOptions: ssrCompose ? createSsrComposeOptions(albumContext) : null
      })
    } catch (e: any) {
      res.status(500).send("服务器错误")
      this.onSsrRenderError(e)
      throw new Error(e, { cause: "ssr.controller" })
    }
  }

  async initModule() {
    const { serverMode, vite, inputs, configs } = await this.context.getContext()
    const { viteDevServer } = vite
    const { realSSRInput, ssrComposeProjectsInput } = inputs

    if (!configs.ssrCompose && serverMode === "start") {
      this.ssrRender = (await import(realSSRInput)).ssrRender
      this.onSsrRenderError = () => {}
      return
    }

    if (configs.ssrCompose && serverMode === "start") {
      const errorPage = ssrComposeProjectsInput.get("error")
      this.ssrRender = async (options: AlbumSSRRenderOptions) => {
        const { req, res } = options.ctlOptions
        const { prefix } = req.albumOptions
        if (!ssrComposeProjectsInput.has(prefix)) {
          if (errorPage) return (await import(errorPage.mainServerInput)).ssrRender(options)
          return res.status(404).send("")
        }
        return (await import(ssrComposeProjectsInput.get(prefix).mainServerInput)).ssrRender(options)
      }
      this.onSsrRenderError = () => {}
      return
    }

    if (serverMode !== "start") {
      this.ssrRender = async options => {
        return (await viteDevServer.ssrLoadModule(realSSRInput)).ssrRender(options)
      }
      this.onSsrRenderError = (e: Error) => viteDevServer.ssrFixStacktrace(e)
      return
    }
  }
}

export function createSsrContextOptions(ctl: CtlOptions, ctx: AlbumContext): AlbumSSRContextOptions {
  return {
    serverDynamicData: {},
    serverRouteData: {},
    ssrSlideProps: {
      req: ctl.req,
      headers: ctl.req.headers as any,
      query: ctl.req.query,
      params: {},
      mode: ctx.mode,
      serverMode: ctx.serverMode,
      inputs: { ...ctx.inputs },
      logger: ctx.logger
    }
  }
}
