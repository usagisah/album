import { Func } from "@albumjs/tools/node"
import { Controller, Get, Headers, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { AlbumContext as DevContext } from "../../context/context.dev.type.js"
import { AlbumContext as StartContext } from "../../context/context.start.type.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { AlbumSSRRenderOptions, CtrlOptions } from "./ssr.type.js"

@Controller()
export class SSRController {
  onSSRenderError?: Func<[any]>

  constructor(private context: AlbumContextService) {
    const ctx = this.context.getContext()
    ctx.serverMode === "start" ? this.initStartModule(ctx as any) : this.initDevModule(ctx as any)
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

  async initStartModule(ctx: StartContext) {
    const { serverMode, ssr, ssrCompose, inputs, env, appManager, ssrComposeManager, logger } = ctx
    const { ssrRender } = appManager
    const { cwd, root } = inputs

    let createOptions = this.context.createSSRRenderOptions
    if (!Reflect.has(createOptions, "overwrite")) {
      createOptions = this.context.createSSRRenderOptions = ({ req, res, headers }) => {
        const getSSRProps = (p = {}) => {
          const c = userSSRRenderOptions.ssrContext
          return {
            query: { ...c.query },
            headers: { ...c.headers },
            params: { ...c.params },
            albumOptions: { ...c.albumOptions },
            logger,
            ...p
          }
        }
        const userSSRRenderOptions: AlbumSSRRenderOptions = {
          ssrContext: {
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
          getSSRProps,
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
      const { projectMap } = ssrComposeManager
      this.ssrRender = async (options: CtrlOptions) => {
        const { req, res } = options
        const { prefix } = req.albumOptions
        const userSSRRenderOptions = createOptions(options)
        const userComposeContext = this.context.createSSRComposeContext()
        userSSRRenderOptions.ssrComposeContext = userComposeContext

        if (!projectMap.has(prefix)) return res.status(404).send()
        return (await import(projectMap.get(prefix)!.mainServerInput)).ssrRender(userSSRRenderOptions)
      }
      return
    }

    this.ssrRender = async options => {
      const userSSRRender = (await import(inputs.mainSSRInput!)).ssrRender
      return userSSRRender(createOptions(options))
    }
  }

  async initDevModule(ctx: DevContext) {
    const { serverMode, ssr, ssrCompose, inputs, env, appManager, viteDevServer, logger } = ctx
    // dev下受惰性创建文件的影响，真实客户端入口属性，在这里直接解构可能是空的
    const { ssrRender } = appManager
    const { cwd, dumpInput } = inputs

    let createOptions = this.context.createSSRRenderOptions
    if (!Reflect.has(createOptions, "overwrite")) {
      createOptions = this.context.createSSRRenderOptions = function ({ req, res, headers }) {
        const getSSRProps = (p = {}) => {
          const c = userSSRRenderOptions.ssrContext
          return {
            query: { ...c.query },
            headers: { ...c.headers },
            params: { ...c.params },
            albumOptions: { ...c.albumOptions },
            logger,
            ...p
          }
        }
        const userSSRRenderOptions: AlbumSSRRenderOptions = {
          ssrContext: {
            serverMode,
            ssr,
            ssrCompose,
            env,
            inputs: { cwd, root: dumpInput, clientEntryInput: appManager.realClientInput },
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
          getSSRProps,
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
      const userSSRRender = (await viteDevServer!.ssrLoadModule(appManager.realSSRInput)).ssrRender
      const userSSRRenderOptions = createOptions(options)
      if (ssrCompose) userSSRRenderOptions.ssrComposeContext = this.context.createSSRComposeContext()
      return userSSRRender(userSSRRenderOptions)
    }
  }
}
