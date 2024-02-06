import { isPlainObject } from "@albumjs/tools/node"
import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { AlbumContext as DevContext } from "../../context/context.dev.type.js"
import { AlbumContext as StartContext } from "../../context/context.start.type.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { AlbumSSRComposeContext, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

@Controller()
export class SSRComposeController {
  constructor(private context: AlbumContextService) {
    const ctx = this.context.getContext()
    ctx.serverMode === "start" ? this.initStartModule(ctx as any) : this.initDevModule(ctx as any)
  }

  replacer(_: string, value: any) {
    if (value instanceof Set) return ["__$_type_set_", ...value.values()]
    return value
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() params: any) {
    if (!Reflect.has(headers, "album-remote-source")) return res.status(404).send()
    if (!params.props || !isPlainObject(params.props)) return res.status(404).send()

    const albumContext = this.context.getContext()
    const { logger } = albumContext
    const { prefix, pathname } = req.albumOptions
    const sourcePath = prefix + pathname

    try {
      const ssrComposeContext = this.context.createSSRComposeContext()
      const result: SSRComposeRenderRemoteComponentReturn = await ssrComposeContext.renderRemoteComponent({ props: params, sourcePath }, { req, res, headers })
      res.send(JSON.stringify({ code: 200, messages: "", result }, this.replacer))
    } catch (error) {
      logger.error("资源序列化失败", error, "ssr-compose")
      return res.send({ code: 500, messages: "资源序列化失败", error })
    }
  }

  async initStartModule(ctx: StartContext) {
    const moduleContext = this.context
    const { ssrComposeManager, logger } = ctx
    const { projectMap, dependenciesMap } = ssrComposeManager
    const loader = async (prefix: string) => {
      if (projectMap.has(prefix)) return await import(projectMap.get(prefix)!.mainServerInput)
      if (projectMap.has("error")) return await import(projectMap.get("error")!.mainServerInput)
      return () => ({})
    }
    const importerMap = {}
    dependenciesMap.forEach((_, id) => (importerMap[id] = `/${id}`))
    this.context.createSSRComposeContext = () => {
      const ssrComposeContext: AlbumSSRComposeContext = {
        ssrComposeRoot: "",
        sources: {},
        projectMap,
        dependenciesMap: importerMap,
        async renderRemoteComponent(renderProps, ctrl) {
          const { req, res } = ctrl
          const { prefix } = req.albumOptions
          const userComposeRender = (await loader(prefix)).renderRemoteComponent

          if (!userComposeRender) {
            logger.error(`找不到(${prefix})匹配的渲染组件`, "album")
            return res.status(404).send()
          }

          const { ssrContext } = moduleContext.createSSRRenderOptions(ctrl)
          const renderOptions: SSRComposeRenderRemoteComponentOptions = {
            renderProps,
            ssrContext,
            ssrComposeContext
          }
          return userComposeRender(renderOptions)
        },
        // existsProject(prefix, sourcePath) {
        //   let value = coordinateInputs.get(prefix)
        //   if (!value) value = coordinateInputs.get("error")
        //   if (!value) return null
        //   const _value = (value as SSRComposeStartCoordinateValue).coordinate[sourcePath]
        //   if (!_value) return null
        //   return value
        // },
        ssrComposeBuild: null as any
      }
      return ssrComposeContext
    }
  }

  async initDevModule(ctx: DevContext) {
    const moduleContext = this.context
    const { viteDevServer, appManager, ssrComposeManager, logger } = ctx
    const { projectMap, build, startRoot } = ssrComposeManager!
    this.context.createSSRComposeContext = () => {
      const ssrComposeContext: AlbumSSRComposeContext = {
        ssrComposeRoot: startRoot,
        sources: {},
        projectMap: projectMap as any,
        dependenciesMap: null as any,
        ssrComposeBuild: build,
        async renderRemoteComponent(renderProps, ctrl) {
          const { req, res } = ctrl
          const { prefix } = req.albumOptions
          const userComposeRender = (await viteDevServer!.ssrLoadModule(appManager.realSSRInput)).renderRemoteComponent

          if (!userComposeRender) {
            logger.error(`找不到(${prefix})匹配的渲染组件`, "album")
            return res.status(404).send()
          }

          const { ssrContext } = moduleContext.createSSRRenderOptions(ctrl)
          const renderOptions: SSRComposeRenderRemoteComponentOptions = {
            renderProps,
            ssrContext,
            ssrComposeContext
          }
          return userComposeRender(renderOptions)
        }
      }
      return ssrComposeContext
    }
  }
}
