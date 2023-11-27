import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { AlbumDevContext, AlbumStartContext } from "context/context.type.js"
import { Request, Response } from "express"
import { existsSync } from "fs"
import { parse, resolve } from "path"
import { UserConfig, mergeConfig, build as viteBuild } from "vite"
import { SSRComposeStartCoordinateValue } from "../../ssrCompose/ssrCompose.type.js"
import { isPlainObject } from "../../utils/check/simple.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { SSRService } from "../ssr/ssr.service.js"
import { SSRComposeService } from "./ssr-compose.service.js"
import { AlbumSSRComposeContext, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

@Controller()
export class SSRComposeController {
  constructor(
    private context: AlbumContextService,
    private ssrService: SSRService,
    private composeService: SSRComposeService
  ) {
    this.initModule()
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() params: any) {
    if (!Object.hasOwn(headers, "album-remote-source")) return res.status(404).send()
    if (!params.props || !isPlainObject(params.props)) return res.status(404).send()

    const albumContext = await this.context.getContext()
    const { logger } = albumContext
    const { prefix, pathname } = req.albumOptions
    const sourcePath = prefix + pathname

    try {
      const ssrComposeContext = this.composeService.createSSRComposeContext()
      const result: SSRComposeRenderRemoteComponentReturn = await ssrComposeContext.renderRemoteComponent({ props: params, sourcePath }, { req, res, headers })
      return res.send({ code: 200, messages: "", result })
    } catch (error) {
      logger.error("资源序列化失败", error, "ssr-compose")
      return res.send({ code: 500, messages: "资源序列化失败", error })
    }
  }

  async initModule() {
    const ctx = await this.context.getContext()
    const ssrService = this.ssrService

    if (ctx.info.serverMode === "start") {
      const { ssrComposeConfig, logger } = ctx as AlbumStartContext
      const { projectInputs, coordinateInputs, dependenciesInputs } = ssrComposeConfig
      const loader = async (prefix: string) => {
        if (projectInputs.has(prefix)) return await import(projectInputs.get(prefix)!.mainServerInput)
        if (projectInputs.has("error")) return await import(projectInputs.get("error")!.mainServerInput)
        return () => ({})
      }
      this.composeService.createSSRComposeContext = () => {
        const ssrComposeContext: AlbumSSRComposeContext = {
          sources: {},
          projectInputs,
          dependenciesMap: dependenciesToMap([...dependenciesInputs.keys()]),
          async renderRemoteComponent(renderProps, ctrl) {
            const { req, res } = ctrl
            const { prefix } = req.albumOptions
            const userComposeRender = (await loader(prefix)).renderRemoteComponent

            if (!userComposeRender) {
              logger.error(`找不到(${prefix})匹配的渲染组件`, "album")
              return res.status(404).send()
            }

            const { ssrContext } = ssrService.createSSRRenderOptions(ctrl)
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
    } else {
      const { viteDevServer, clientConfig, userConfig, ssrComposeConfig, logger } = ctx as AlbumDevContext
      const { module } = clientConfig
      const { projectInputs, dependencies } = ssrComposeConfig!
      this.composeService.createSSRComposeContext = () => {
        const ssrComposeContext: AlbumSSRComposeContext = {
          sources: {},
          projectInputs: null,
          dependenciesMap: dependenciesToMap(dependencies),
          viteComponentBuild: async ({ input, outDir }) => {
            const config = mergeConfig(userConfig.vite ?? {}, {
              mode: "development",
              logLevel: "error",
              build: {
                manifest: true,
                minify: false,
                cssMinify: false,
                rollupOptions: {
                  input,
                  external: [/node_modules/]
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
            const userComposeRender = (await viteDevServer!.ssrLoadModule(clientConfig.mainSSRInput!)).renderRemoteComponent

            if (!userComposeRender) {
              logger.error(`找不到(${prefix})匹配的渲染组件`, "album")
              return res.status(404).send()
            }

            const { ssrContext } = ssrService.createSSRRenderOptions(ctrl)
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
}

function dependenciesToMap(arr: string[]) {
  const res: Record<string, string> = {}
  for (const v of arr) res[v] + "/" + v
  return res
}
