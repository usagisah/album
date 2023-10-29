import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { ViteConfig } from "../../middlewares/middlewares.type.js"
import type { SSRComposeContextProps, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { existsSync } from "fs"
import { parse as pathParse, resolve } from "path"
import { mergeConfig, build as viteBuild } from "vite"
import { isPlainObject } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { createSsrContextOptions } from "../ssr/ssr.controller.js"

@Controller()
export class SsrComposeController {
  loadRenderFactory: (prefix: string) => Promise<any>

  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() props: any) {
    if (!Object.hasOwn(headers, "album-remote-source")) {
      return res.status(404).send("")
    }
    if (!checkRemoteProps(props)) {
      return res.status(404).send("")
    }

    const albumContext = await this.context.getContext()
    const { logger } = albumContext
    const { prefix, pathname } = req.albumOptions
    const sourcePath = prefix + pathname

    try {
      const { renderRemoteComponent } = await this.loadRenderFactory(req.albumOptions.prefix)
      if (!renderRemoteComponent) return res.status(404).send("")

      const ctlOptions = { req, res, headers }
      const ssrRenderOptions = {
        serverContext: albumContext,
        ctlOptions,
        ssrContextOptions: createSsrContextOptions(ctlOptions, albumContext),
        ssrComposeOptions: createSsrComposeOptions(albumContext)
      }
      const ssrComposeContextProps: SSRComposeContextProps = {
        sources: {},
        renderRemoteComponent(renderProps) {
          const renderOptions: SSRComposeRenderRemoteComponentOptions = {
            renderProps,
            ssrRenderOptions,
            ssrComposeContextProps
          }
          return renderRemoteComponent(renderOptions)
        }
      }
      const renderOptions: SSRComposeRenderRemoteComponentOptions = {
        renderProps: { props, sourcePath },
        ssrComposeContextProps,
        ssrRenderOptions
      }
      const result: SSRComposeRenderRemoteComponentReturn = await renderRemoteComponent(renderOptions)
      return res.send({ code: 200, messages: "", result })
    } catch (error) {
      logger.error("资源序列化失败", error, "ssr-compose")
      return res.send({ code: 500, messages: "资源序列化失败", error })
    }
  }

  async initModule() {
    const { serverMode, vite, inputs } = await this.context.getContext()
    const { realSSRInput, ssrComposeProjectsInput } = inputs
    const { viteDevServer } = vite
    if (serverMode === "start") {
      return (this.loadRenderFactory = async prefix => {
        if (ssrComposeProjectsInput.has(prefix)) return await import(ssrComposeProjectsInput.get(prefix).serverInput)
        if (ssrComposeProjectsInput.has("error")) return await import(ssrComposeProjectsInput.get("error").serverInput)
        return () => ({})
      })
    }
    this.loadRenderFactory = async () => viteDevServer.ssrLoadModule(realSSRInput)
  }
}

function checkRemoteProps(value: unknown) {
  if (!isPlainObject(value)) {
    return false
  }

  if (!value.props || !isPlainObject(value.props)) {
    return false
  }

  return true
}

export function createSsrComposeOptions(ctx: AlbumContext) {
  const { serverMode, vite } = ctx
  const { viteConfig } = vite
  return serverMode === "start"
    ? {
        viteComponentBuild: () => {
          throw "viteComponentBuild 只能在开发阶段被调用"
        },
        existsProject: createStartExistsProject(ctx)
      }
    : {
        viteComponentBuild: createViteComponentBuild(viteConfig),
        existsProject: createDevExistsProject(ctx)
      }
}

function createViteComponentBuild(viteConfig: ViteConfig) {
  return async ({ input, outDir }: any) => {
    const config = mergeConfig(viteConfig, {
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
          fileName: pathParse(input).name
        },
        outDir,
        cssCodeSplit: false
      }
    } as ViteConfig)
    await viteBuild(config)
  }
}

function createStartExistsProject(ctx: AlbumContext) {
  const { inputs } = ctx
  const { ssrComposeCoordinateInput } = inputs
  return (prefix: string, sourcePath: string) => {
    let value = ssrComposeCoordinateInput.get(prefix)
    if (!value) value = ssrComposeCoordinateInput.get("error")
    if (!value) return null

    const _value = value.coordinate[sourcePath]
    if (!_value) return null

    return value
  }
}

function createDevExistsProject(ctx: AlbumContext): any {
  const { inputs, configs } = ctx
  const { ssrComposeProjectsInput } = inputs
  const { modulePath } = configs.clientConfig.module
  return (prefix: string, sourcePath: string) => {
    if (!ssrComposeProjectsInput.has(prefix)) return null
    const devFilepath = resolve(modulePath, "../", sourcePath)
    return existsSync(resolve(devFilepath)) ? { devFilepath } : null
  }
}
