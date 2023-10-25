import type { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import type { NextFunction, Request, Response } from "express"
import serverStatic from "serve-static"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { MiddlewareConfigs } from "../../middlewares/middlewares.type.js"
import { SsrComposeModule } from "../../modules/ssr-compose/ssr-compose.module.js"

const placeholderHost = "http://host"

export async function ssrComposeMiddleware(app: INestApplication<any>, midConfigs: MiddlewareConfigs, context: AlbumContext) {
  const { mode, inputs } = context
  const { ssrCompose } = context.configs

  if (mode === "production") {
    const { ssrComposeProjectsInput } = inputs
    midConfigs.get("serve-static").factory = function proxyServerStaticFactory(_, options: any) {
      return function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
        const url = new URL(placeholderHost + req.path)
        let prefix = url.pathname.split("/")[1].toLowerCase()
        if (prefix === "") prefix = "home"

        if (!ssrComposeProjectsInput.has(prefix)) {
          req.albumOptions = { pathname: url.pathname, prefix: null }
          return next()
        }

        const pathname = url.pathname.slice(prefix.length)
        req.albumOptions = { prefix, pathname }
        if (pathname === "/manifest.json") return res.status(404).send("not founded")
        return serverStatic(ssrComposeProjectsInput.get(prefix).clientInput, options)(req, res, next)
      }
    }
  } else {
    app.use(function (req: Request, res: Response, next: NextFunction) {
      req.albumOptions = { pathname: req.path, prefix: null }
      next()
    })
  }

  if (ssrCompose) {
    const nestModuleLoader = app.get(LazyModuleLoader)
    await nestModuleLoader.load(() => SsrComposeModule)
  }
}
