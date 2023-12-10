import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { AlbumDevContext, AlbumStartContext } from "../../context/context.type.js"
import { Func } from "../../utils/types/types.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { AlbumSSRRenderOptions, CtrlOptions } from "./ssr.type.js"

@Controller()
export class SSRController {
  onSSRenderError?: Func<[any]>

  constructor(private context: AlbumContextService) {
    const ctx = this.context.getContext()
    ctx.info.serverMode === "start" ? this.initStartModule(ctx as any) : this.initDevModule(ctx as any)
  }

  private async ssrRender(opts: CtrlOptions) {
    throw "未初始化的 album builtin ssrRender"
  }

  private ssrRenderError(reason: unknown, res: Response) {
    throw "未初始化的 album builtin ssrRenderError"
  }

  @Get("*")
  async ssr(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>) {
    await this.ssrRender({ req, res, headers }).catch(e => this.ssrRenderError(e, res))
  }

  async initStartModule(ctx: AlbumStartContext) {
    const { info, logger, clientConfig, ssrComposeConfig } = ctx
    const { ssrRender } = clientConfig
    const { mode, serverMode, ssr, ssrCompose, inputs, env } = info
    const { cwd, root } = inputs
    const { projectInputs } = ssrComposeConfig

    let createOptions = this.context.createSSRRenderOptions
    if (!Reflect.has(createOptions, "overwrite")) {
      createOptions = this.context.createSSRRenderOptions = ({ req, res, headers }) => {
        const userSSRRenderOptions: AlbumSSRRenderOptions = {
          ssrContext: {
            mode,
            serverMode,
            ssr,
            ssrCompose,
            env,
            inputs: { cwd, root: root!, clientEntryInput: "" },
            ssrRender,

            req,
            res,
            headers,
            albumOptions: { ...req.albumOptions },
            query: req.query,
            params: {},
            logger,

            serverDynamicData: {},
            serverRouteData: {}
          },
          ssrComposeContext: null
        }
        return userSSRRenderOptions
      }
      Object.defineProperty(createOptions, "overwrite", { configurable: false, enumerable: false, get: () => true })
    }

    this.ssrRenderError = (e, res) => {
      res.status(500).send("服务器错误")
      logger.error(e, "album")
    }

    if (ssrCompose) {
      this.ssrRender = async (options: CtrlOptions) => {
        const { req, res } = options
        const { prefix } = req.albumOptions
        const userSSRRenderOptions = createOptions(options)
        const userComposeContext = this.context.createSSRComposeContext()
        userSSRRenderOptions.ssrComposeContext = userComposeContext

        if (!projectInputs.has(prefix)) return res.status(404).send()
        return (await import(projectInputs.get(prefix)!.mainServerInput)).ssrRender(userSSRRenderOptions)
      }
      return
    }

    this.ssrRender = async options => {
      const userSSRRender = (await import(inputs.mainSSRInput!)).ssrRender
      return userSSRRender(createOptions(options))
    }
  }

  async initDevModule(ctx: AlbumDevContext) {
    const { info, clientConfig, clientManager, viteDevServer, logger } = ctx
    const { ssrRender } = clientConfig
    const { mode, serverMode, ssr, ssrCompose, env, inputs } = info
    const { cwd, dumpInput } = inputs
    const { realSSRInput, realClientInput } = clientManager!

    let createOptions = this.context.createSSRRenderOptions
    if (!Reflect.has(createOptions, "overwrite")) {
      createOptions = this.context.createSSRRenderOptions = function ({ req, res, headers }) {
        const userSSRRenderOptions: AlbumSSRRenderOptions = {
          ssrContext: {
            mode,
            serverMode,
            ssr,
            ssrCompose,
            env,
            inputs: { cwd, root: dumpInput, clientEntryInput: realClientInput },
            ssrRender,

            req,
            res,
            headers,
            albumOptions: { ...req.albumOptions },
            query: req.query,
            params: {},
            logger,

            serverDynamicData: {},
            serverRouteData: {}
          },
          ssrComposeContext: null
        }
        return userSSRRenderOptions
      }
      Object.defineProperty(createOptions, "overwrite", { configurable: false, enumerable: false, get: () => true })
    }

    this.ssrRenderError = (e, res) => {
      res.status(500).send("服务器错误")
      viteDevServer!.ssrFixStacktrace(e as any)
      logger.error(e, "album")
    }

    this.ssrRender = async options => {
      const userSSRRender = (await viteDevServer!.ssrLoadModule(realSSRInput!)).ssrRender
      const userSSRRenderOptions = createOptions(options)
      if (ssrCompose) userSSRRenderOptions.ssrComposeContext = this.context.createSSRComposeContext()
      return userSSRRender(userSSRRenderOptions)
    }
  }
}
