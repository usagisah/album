import type { INestApplication } from "@nestjs/common"
import type { AlbumContext } from "../../context/AlbumContext.type.js"
import type { MiddlewareConfigs } from "../../middlewares/middlewares.type.js"
import type { Request, Response, NextFunction } from "express"
import { LazyModuleLoader } from "@nestjs/core"
import { readdirSync } from "fs"
import { resolve } from "path"
import serverStatic from "serve-static"
import { SsrRemoteModule } from "../../modules/ssr-remote/ssr-remote.module.js"

export async function ssrComposeMiddleware(
  app: INestApplication<any>,
  midConfigs: MiddlewareConfigs,
  context: AlbumContext
) {
  const { root } = context.configs.ssrCompose
  const composePkgs = new Map<string, any>()

  midConfigs.get("serve-static").factory = function proxyServerStaticFactory(...configs: any[]) {
    let hasErrorApp = false
    for (const dirName of readdirSync(root, "utf-8")) {
      const _dirName = dirName.toLowerCase()
      if (_dirName === "error") hasErrorApp = true

      const clientPath = resolve(root, dirName, "client")
      const serverPath = resolve(root, dirName, "client")
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

  const nestModuleLoader = app.get(LazyModuleLoader)
  await nestModuleLoader.load(() => SsrRemoteModule)
}
