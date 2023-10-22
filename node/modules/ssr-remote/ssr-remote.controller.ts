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
    const describe = headers["album-remote-source"]
    if (!describe) {
      return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })
    }

    const [sourcePath] = describe.split(";")
    if (!sourcePath) return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })

    const ssrRemoteStruct = this.resolveSSRRemoteStruct(props)
    if (ssrRemoteStruct === false) return res.status(404).send({ reason: "非法 ssr-remote 资源请求" })

    const { mode, vite, configs, inputs, logger, serverMode, outputs } = await this.context.getContext()
    const { modulePath } = configs.clientConfig.module
    const { viteDevServer, viteConfig } = vite
    // const { modulePath } = configs.clientConfig.module
    // const filePath = await findEntryPath({
    //   cwd: resolve(modulePath, "../"),
    //   name: resolve(modulePath, "../", sourcePath)
    // })
    // if (!filePath) {
    //   return res.status(404).send({ reason: "ssr-remote 指定资源不存在" })
    // }
    try {
      const { renderRemoteComponent } = await viteDevServer.ssrLoadModule(inputs.realSSRComposeInput)
      if (!renderRemoteComponent) {
        return res.status(500).send({ reason: "服务器错误" })
      }

      const params: any = {
        logger,
        sourcePath,
        props,
        inputs,
        mountContext: true,
        sources: ssrRemoteStruct.sources,
        moduleRoot: resolve(modulePath, "../"),
        viteComponentBuild: this.createViteComponentBuild(viteConfig)
      }
      const result = await renderRemoteComponent(params)

      // const ssrRemoteOptions: AlbumSSRRemoteOptions = {
      //   req,
      //   headers,
      //   sourcePath,
      //   filePath,
      //   ssrRemoteStruct
      // }
      // const ssrRemoteContext: AlbumSSRRemoteContext = {
      //   inputs,
      //   logger,
      //   mode,
      //   outputs,
      //   serverMode,
      //   viteDevServer,
      //   createViteConfig: () => {

      //   }
      // }

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

    if (!value.messages || !isPlainObject(value.messages)) {
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
          ssrManifest: true,
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
