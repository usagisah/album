import type { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import type { NextFunction, Request, Response } from "express"
import serverStatic from "serve-static"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { MiddlewareConfigs } from "../../middlewares/middlewares.type.js"
import { SsrComposeModule } from "../../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"

const placeholderHost = "http://host"

export async function ssrComposeMiddleware(app: INestApplication<any>, midConfigs: MiddlewareConfigs, context: AlbumContext) {
  const { app: application, mode, inputs } = context
  const { ssrCompose } = context.configs

  if (mode === "production") {
    const { ssrComposeProjectsInput } = inputs
    midConfigs.get("serve-static").factory = function proxyServerStaticFactory(_, options: any) {
      return function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
        const { pathname, prefix } = normalizeMidRequestOptions(req.path)

        if (!ssrComposeProjectsInput.has(prefix)) {
          req.albumOptions = { pathname, prefix: null }
          return next()
        }

        req.albumOptions = { pathname, prefix }
        if (pathname === "/manifest.json") return res.status(404).send("")
        return serverStatic(ssrComposeProjectsInput.get(prefix).clientInput, options)(req, res, next)
      }
    }
  } else {
    app.use(function (req: Request, res: Response, next: NextFunction) {
      const { pathname, prefix } = normalizeMidRequestOptions(req.path)
      req.albumOptions = { pathname, prefix }
      next()
    })
  }

  if (ssrCompose) {
    const nestModuleLoader = app.get(LazyModuleLoader)
    await nestModuleLoader.load(() => SsrComposeModule)
  }
}
