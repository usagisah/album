import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { ViteConfig } from "../../middlewares/middlewares.type.js"
import type { AlbumSSRContextProps } from "../ssr/ssr.type.js"
import type { SSRComposeContextProps, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { parse as pathParse } from "path"
import { mergeConfig, build as viteBuild } from "vite"
import { isPlainObject } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"

@Controller()
export class SsrComposeController {
  loadRenderFactory: (prefix: string) => Promise<any>

  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() props: any) {
    if (!Object.hasOwn(headers, "album-remote-source")) {
      return res.status(404).send({ code: 404, messages: "非法 ssr-remote 资源请求" })
    }
    if (!checkRemoteProps(props)) {
      return res.status(404).send({ code: 404, messages: "非法 ssr-remote 资源请求" })
    }

    const albumContext = await this.context.getContext()
    const { mode, inputs, logger, serverMode, outputs } = albumContext
    const sourcePath = req.path

    try {
      const { renderRemoteComponent } = await this.loadRenderFactory(req.albumOptions.prefix)
      if (!renderRemoteComponent) return res.status(404).send({ code: 404, messages: "该服务不支持 ssr-compose" })

      const ssrComposeOptions = createSsrComposeOptions(albumContext)
      if (!ssrComposeOptions.moduleRoot) return res.status(404).send({ code: 404, messages: "not founded" })

      const ssrContextProps: AlbumSSRContextProps = {
        serverDynamicData: {},
        serverRouteData: {},
        ssrSlideProps: {
          pathname: req.albumOptions.pathname,
          headers,
          inputs,
          logger,
          meta: {},
          mode,
          outputs,
          params: {},
          query: req.query,
          req,
          serverMode
        }
      }
      const ssrComposeContextProps: SSRComposeContextProps = {
        sources: {},
        ssrComposeOptions,
        renderRemoteComponent(renderProps) {
          const renderOptions: SSRComposeRenderRemoteComponentOptions = {
            renderProps,
            ssrContextProps,
            ssrComposeContextProps
          }
          return renderRemoteComponent(renderOptions)
        }
      }
      const renderOptions: SSRComposeRenderRemoteComponentOptions = {
        renderProps: {
          props,
          sourcePath
        },
        ssrContextProps,
        ssrComposeContextProps
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
  const { inputs, vite } = ctx
  const { viteConfig } = vite
  return {
    moduleRoot: inputs.ssrComposeModuleRootInput,
    viteComponentBuild: createViteComponentBuild(viteConfig)
  }
}

function createViteComponentBuild(viteConfig: ViteConfig) {
  return async function viteComponentBuild({ input, outDir }: any) {
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
