import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
import { PluginOnSSREnterParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { createSsrComposeOptions } from "../ssr-compose/ssr-compose.controller.js"
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
          ssrOptions: { pathname: req.albumOptions.pathname, req, res, headers: { ...headers } },
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
        ssrComposeOptions: configs.ssrCompose ? createSsrComposeOptions(albumContext) : null
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
        const { req, res } = options.ssrOptions
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
