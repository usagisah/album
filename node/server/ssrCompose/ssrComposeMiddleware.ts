import type { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import type { NextFunction, Request, Response } from "express"
import { readdirSync } from "fs"
import { resolve } from "path"
import serverStatic from "serve-static"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { MiddlewareConfigs } from "../../middlewares/middlewares.type.js"
import { SsrComposeModule } from "../../modules/ssr-compose/ssr-compose.module.js"

export async function ssrComposeMiddleware(app: INestApplication<any>, midConfigs: MiddlewareConfigs, context: AlbumContext) {
  const { mode, configs } = context
  const { moduleRoot } = configs.ssrCompose
  const composePkgs = new Map<string, any>()

  if (mode === "production") {
    midConfigs.get("serve-static").factory = function proxyServerStaticFactory(...configs: any[]) {
      let hasErrorApp = false
      for (const dirName of readdirSync(moduleRoot, "utf-8")) {
        const _dirName = dirName.toLowerCase()
        if (_dirName === "error") hasErrorApp = true

        const clientPath = resolve(moduleRoot, dirName, "client")
        const serverPath = resolve(moduleRoot, dirName, "client")
        composePkgs.set(_dirName, {
          clientPath,
          serverPath,
          serverStatic: serverStatic.apply(globalThis, configs[1])
        })
      }
      return function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
        const url = new URL(req.url)
        let prefix = url.pathname.split("/")[1].toLowerCase()
        if (prefix === "") prefix = "home"
        if (!composePkgs.has(prefix)) {
          if (!hasErrorApp) {
            return res.status(404).send("source not found")
          }

          prefix = "error"
        }
        if (url.pathname.slice(prefix.length).startsWith("/manifest.json")) {
          return res.status(404).send("source not found")
        }
        return composePkgs.get(prefix).serverStatic(req, res, next)
      }
    }
  }

  const nestModuleLoader = app.get(LazyModuleLoader)
  await nestModuleLoader.load(() => SsrComposeModule)
}
