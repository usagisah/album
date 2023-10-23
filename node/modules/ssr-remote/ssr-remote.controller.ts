import { Body, Controller, Headers, Post, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { resolve, parse as pathParse } from "path"
import { mergeConfig, build as viteBuild, type InlineConfig as ViteInlineConfig } from "vite"
import { findEntryPath, isPlainObject } from "../../utils/utils.js"
import { AlbumContextService } from "../context/album-context.service.js"
import { createSSRRemoteStruct } from "./ssr-remote.struct.js"

@Controller()
export class SsrRemoteController {
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

    const { mode, vite, configs, inputs, logger, serverMode, outputs } = await this.context.getContext()
    const { modulePath } = configs.clientConfig.module
    const { viteDevServer, viteConfig } = vite
    const sourcePath = req.path

    try {
      const { renderRemoteComponent } = await viteDevServer.ssrLoadModule(inputs.realSSRComposeInput)
      if (!renderRemoteComponent) {
        return res.status(500).send({ reason: "服务器错误" })
      }

      const params: any = {
        sourcePath,
        props,
        sources: ssrRemoteStruct.sources,
        moduleRoot: resolve(modulePath, "../"),
        ssrContextProps: null,
        serverRouteData: {},
        albumSSROptions: {},
        albumSSRContext: {},
        viteComponentBuild: this.createViteComponentBuild(viteConfig)
      }
      const result = await renderRemoteComponent(params)

      // res.send(ssrRemoteStruct)
      res.status(200).send(result)
    } catch (error) {
      return res.status(500).send({ reason: "服务器错误", error })
    }
  }

  resolveSSRRemoteStruct(value: unknown) {
    if (!isPlainObject(value)) {
      return false
    }

    if (!value.props || !isPlainObject(value.props)) {
      return false
    }

    return createSSRRemoteStruct(value.messages, value.props)
  }

  createViteComponentBuild(viteConfig: ViteInlineConfig) {
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
