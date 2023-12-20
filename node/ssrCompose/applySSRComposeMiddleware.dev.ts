import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { AlbumContext } from "../context/context.dev.type.js"
import { SSRComposeModule } from "../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"
import { createPathRewriter } from "./rewriteUrl.js"

export async function applySSRComposeDevMiddleware(app: INestApplication<any>, context: AlbumContext) {
  const { ssrCompose } = context
  if (!ssrCompose) return
  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { ssrComposeManager } = context
  const { rewrites } = ssrComposeManager!
  const rewriter = createPathRewriter(rewrites)
  app.use(function (req: Request, res: Response, next: NextFunction) {
    rewriter(req)
    const albumOptions = normalizeMidRequestOptions(req.originalUrl, projectInputs)
    const { prefix, url } = albumOptions
    req.albumOptions = albumOptions
    if (!projectInputs.has(prefix)) return res.status(404).send()
    req.url = url
    next()
  })
}
