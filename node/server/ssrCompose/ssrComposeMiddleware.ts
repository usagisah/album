import type { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import type { NextFunction, Request, Response } from "express"
import serverStatic from "serve-static"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { MiddlewareConfigs } from "../../middlewares/middlewares.type.js"
import { SsrComposeModule } from "../../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"
import { readFile } from "fs/promises"

export async function ssrComposeMiddleware(app: INestApplication<any>, midConfigs: MiddlewareConfigs, context: AlbumContext) {
  const { mode, inputs } = context
  const { ssrCompose } = context.configs
  const { ssrComposeProjectsInput, ssrComposeDependencies } = inputs

  if (mode === "production") {
    midConfigs.get("serve-static").factory = function proxyServerStaticFactory(_, options: any) {
      return async function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
        const reqPath = req.path
        const dependencyInfo = ssrComposeDependencies[reqPath.slice(1)]
        if (dependencyInfo) {
          const file = await readFile(dependencyInfo.filepath, "utf-8")
          res.header("Content-Type", "application/javascript")
          res.send(file)
          return
        }

        const { pathname, prefix, url } = normalizeMidRequestOptions(reqPath, ssrComposeProjectsInput)
        req.albumOptions = { pathname, prefix }
        if (!ssrComposeProjectsInput.has(prefix) || pathname === "/manifest.json") return res.status(404).send("")
        req.url = url
        return serverStatic(ssrComposeProjectsInput.get(prefix).clientInput, options)(req, res, next)
      }
    }
  } else {
    app.use(function (req: Request, res: Response, next: NextFunction) {
      const { pathname, prefix, url } = normalizeMidRequestOptions(req.originalUrl, ssrComposeProjectsInput)
      req.albumOptions = { pathname, prefix }
      if (!ssrComposeProjectsInput.has(prefix)) return res.status(404).send("")
      req.url = url
      next()
    })
  }

  if (ssrCompose) {
    const nestModuleLoader = app.get(LazyModuleLoader)
    await nestModuleLoader.load(() => SsrComposeModule)
  }
}
