import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { AlbumDevContext } from "../../context/context.type.js"
import { SSRComposeModule } from "../../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "../normalizeMidRequestOptions.js"

export async function applySSRComposeDevMiddleware(app: INestApplication<any>, context: AlbumDevContext) {
  const { info, ssrComposeConfig } = context
  const { ssrCompose } = info
  if (!ssrCompose) return
  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { projectInputs } = ssrComposeConfig!
  app.use(function (req: Request, res: Response, next: NextFunction) {
    const { pathname, prefix, url } = normalizeMidRequestOptions(req.originalUrl, projectInputs)
    req.albumOptions = { pathname, prefix }
    if (!projectInputs.has(prefix)) return res.status(404).send("")
    req.url = url
    next()
  })
}
