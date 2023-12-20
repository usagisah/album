import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { existsSync } from "fs"
import { parse, resolve } from "path"
import { UserConfig, mergeConfig, build as viteBuild } from "vite"
import { SSRComposeStartCoordinateValue } from "../../ssrCompose/ssrCompose.start.type.js"
import { isPlainObject } from "../../utils/check/simple.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { AlbumSSRComposeContext, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

@Controller()
export class SSRComposeController {
  constructor(private context: AlbumContextService) {
    const ctx = this.context.getContext()
    ctx.info.serverMode === "start" ? this.initStartModule(ctx as any) : this.initDevModule(ctx as any)
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() params: any) {
    if (!Object.hasOwn(headers, "album-remote-source")) return res.status(404).send()
    if (!params.props || !isPlainObject(params.props)) return res.status(404).send()

    const albumContext = this.context.getContext()
    const { logger } = albumContext
    const { prefix, pathname } = req.albumOptions
    const sourcePath = prefix + pathname

    try {
      const ssrComposeContext = this.context.createSSRComposeContext()
      const result: SSRComposeRenderRemoteComponentReturn = await ssrComposeContext.renderRemoteComponent({ props: params, sourcePath }, { req, res, headers })
      return res.send({ code: 200, messages: "", result })
    } catch (error) {
      logger.error("资源序列化失败", error, "ssr-compose")
      return res.send({ code: 500, messages: "资源序列化失败", error })
    }
  }

  async initStartModule(ctx: AlbumStartContext) {
    const moduleContext = this.context
    const { ssrComposeConfig, logger } = ctx
    const { projectInputs, coordinateInputs, dependenciesInputs } = ssrComposeConfig
    const loader = async (prefix: string) => {
      if (projectInputs.has(prefix)) return await import(projectInputs.get(prefix)!.mainServerInput)
      if (projectInputs.has("error")) return await import(projectInputs.get("error")!.mainServerInput)
      return () => ({})
    }
    const dependenciesMap = {}
    dependenciesInputs.forEach((_, id) => (dependenciesMap[id] = `/${id}`))
    this.context.createSSRComposeContext = () => {
      const ssrComposeContext: AlbumSSRComposeContext = {
        sources: {},
        projectInputs,
        dependenciesMap,
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
        existsProject(prefix, sourcePath) {
          let value = coordinateInputs.get(prefix)
          if (!value) value = coordinateInputs.get("error")
          if (!value) return null
          const _value = (value as SSRComposeStartCoordinateValue).coordinate[sourcePath]
          if (!_value) return null
          return value
        },
        viteComponentBuild: null
      }
      return ssrComposeContext
    }
  }

  async initDevModule(ctx: AlbumDevContext) {
    const moduleContext = this.context
    const { viteDevServer, clientConfig, clientManager, userConfig, ssrComposeConfig, logger } = ctx
    const { module } = clientConfig
    const { projectInputs, dependencies } = ssrComposeConfig!
    this.context.createSSRComposeContext = () => {
      const ssrComposeContext: AlbumSSRComposeContext = {
        sources: {},
        projectInputs: null,
        dependenciesMap: null,
        viteComponentBuild: async ({ input, outDir }) => {
          const ids: string[] = []
          const config = mergeConfig(userConfig.vite ?? {}, {
            mode: "development",
            logLevel: "error",
            plugins: [
              {
                name: "album:ssr-compose-collect",
                buildEnd(error) {
                  if (error) return
                  for (const id of Array.from(this.getModuleIds())) {
                    if (!id.startsWith("/")) continue
                    if (id.includes("node_modules")) continue
                    ids.push(id)
                  }
                }
              }
            ],
            build: {
              manifest: true,
              minify: false,
              cssMinify: false,
              rollupOptions: {
                input,
                external: [/node_modules/, ...dependencies]
              },
              lib: {
                entry: input,
                formats: ["es"],
                fileName: parse(input).name
              },
              outDir,
              cssCodeSplit: false
            }
          } as UserConfig)
          /* 

          composeInfo {
            deps: Map[depInput, {
              filepath: string
              dirty: boolean
              manifest: {},
              sourceId: string[]
            }],
            sourceIds: Map[string, { deps: Set[] }]
          }
          */
          await viteBuild(config)
        },
        existsProject: (prefix, sourcePath) => {
          if (!projectInputs.has(prefix)) return null
          const devFilepath = resolve(module!.modulePath, "../", sourcePath)
          return existsSync(resolve(devFilepath)) ? { devFilepath } : null
        },
        async renderRemoteComponent(renderProps, ctrl) {
          const { req, res } = ctrl
          const { prefix } = req.albumOptions
          const userComposeRender = (await viteDevServer!.ssrLoadModule(clientManager!.realSSRInput!)).renderRemoteComponent

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
