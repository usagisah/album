import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { AlbumContext } from "../context/context.dev.type.js"
import { SSRComposeModule } from "../modules/ssr-compose/ssr-compose.module.js"
import { isStringEmpty } from "../utils/check/simple.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"

export async function applySSRComposeDevMiddleware(app: INestApplication<any>, context: AlbumContext) {
  const { ssrCompose } = context
  if (!ssrCompose) return
  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { ssrComposeManager } = context
  const { rewriter, projectMap } = ssrComposeManager!
  app.use(function (req: Request, res: Response, next: NextFunction) {
    const _url = rewriter(req.url)
    if (!isStringEmpty(_url)) req.url = _url

    const albumOptions = normalizeMidRequestOptions(req.originalUrl, projectMap)
    const { prefix, url } = albumOptions
    req.albumOptions = albumOptions
    if (!projectMap.has(prefix)) return res.status(404).send()
    req.url = url
    next()
  })
}
