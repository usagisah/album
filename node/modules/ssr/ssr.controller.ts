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
    const { mode, vite, inputs, configs } = await this.context.getContext()
    const { viteDevServer } = vite
    const { realSSRInput, ssrComposeProjectsInput } = inputs

    if (!configs.ssrCompose && mode === "production") {
      this.ssrRender = (await import(realSSRInput)).default
      this.onSsrRenderError = () => {}
      return
    }

    if (configs.ssrCompose && mode === "production") {
      const errorPage = ssrComposeProjectsInput.get("error")
      this.ssrRender = async (options: AlbumSSRRenderOptions) => {
        const { req, res } = options.ssrOptions
        const { prefix } = req.albumOptions
        if (!ssrComposeProjectsInput.has(prefix)) {
          if (errorPage) return import(errorPage.mainServerInput)
          return res.status(404).send("")
        }
        return import(ssrComposeProjectsInput.get(prefix).mainServerInput)
      }
      this.onSsrRenderError = () => {}
      return
    }

    if (mode === "development") {
      this.ssrRender = async (...params: any[]) => {
        return (await viteDevServer.ssrLoadModule(realSSRInput)).default(...params)
      }
      this.onSsrRenderError = (e: Error) => viteDevServer.ssrFixStacktrace(e)
      return
    }
  }
}
