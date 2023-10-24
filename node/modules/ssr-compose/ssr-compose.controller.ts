import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { parse as pathParse } from "path"
import { mergeConfig, build as viteBuild, type InlineConfig as ViteInlineConfig } from "vite"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import { isPlainObject } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import type { AlbumSSRContextProps } from "../ssr/ssr.type.js"
import { createSSRRemoteStruct } from "./ssr-compose.struct.js"
import type { SSRComposeContextProps, SSRComposeRenderRemoteComponentOptions, SSRComposeRenderRemoteComponentReturn } from "./ssr-compose.type.js"

@Controller()
export class SsrComposeController {
  constructor(private context: AlbumContextService) {
    this.initModule()
  }

  @Post("*")
  async ssrRemoteEntry(@Req() req: Request, @Res() res: Response, @Headers() headers: Record<string, string>, @Body() props: any) {
    if (!Object.hasOwn(headers, "album-remote-source")) {
      return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })
    }

    const ssrRemoteStruct = this.resolveSSRRemoteStruct(props)
    if (ssrRemoteStruct === false) return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })

    const albumContext = await this.context.getContext()
    const { mode, vite, inputs, logger, serverMode, outputs } = albumContext
    const { viteDevServer } = vite
    const sourcePath = req.path

    try {
      const { renderRemoteComponent } = await viteDevServer.ssrLoadModule(inputs.realSSRComposeInput)
      if (!renderRemoteComponent) {
        return res.status(500).send({ reason: "服务器错误" })
      }

      const ssrContextProps: AlbumSSRContextProps = {
        serverDynamicData: {},
        serverRouteData: {},
        ssrSlideProps: {
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
        ssrComposeOptions: SsrComposeController.createSsrComposeOptions(albumContext),
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
      return res.send({ code: 500, messages: "资源序列化失败", error })
    }
  }

  resolveSSRRemoteStruct(value: unknown) {
    if (!isPlainObject(value)) {
      return false
    }

    if (!value.props || !isPlainObject(value.props)) {
      return false
    }

    return createSSRRemoteStruct(value.props)
  }

  static createSsrComposeOptions(ctx: AlbumContext) {
    const { mode, configs, vite } = ctx
    const { moduleRoot, devModuleRoot } = configs.ssrCompose
    const { viteConfig } = vite
    return {
      moduleRoot: mode === "production" ? moduleRoot : devModuleRoot,
      viteComponentBuild: this.createViteComponentBuild(viteConfig)
    }
  }

  static createViteComponentBuild(viteConfig: ViteInlineConfig) {
    return async function viteComponentBuild({ input, outDir }: any) {
      const config = mergeConfig(viteConfig, {
        mode: "development",
        logLevel: "error",
        build: {
          manifest: true,
          minify: false,
          cssMinify: false,
          rollupOptions: {
            input
          },
          lib: {
            entry: input,
            formats: ["es"],
            fileName: pathParse(input).name
          },
          assetsDir: "assets",
          outDir
        }
      } as ViteInlineConfig)
      await viteBuild(config)
    }
  }

  async initModule() {}
}
