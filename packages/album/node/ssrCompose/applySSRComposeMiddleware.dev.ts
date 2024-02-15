import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { AlbumContext } from "../context/context.dev.type.js"
import { SSRComposeModule } from "../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"

export async function applySSRComposeDevMiddleware(app: INestApplication<any>, context: AlbumContext) {
  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { ssrComposeManager } = context
  const { projectMap } = ssrComposeManager!
  app.use(function (req: Request, res: Response, next: NextFunction) {
    const albumOptions = normalizeMidRequestOptions(req.originalUrl, projectMap)
    req.albumOptions = albumOptions
    if (!projectMap.has(albumOptions.prefix)) {
      return res.status(404).send()
    }
    req.url = albumOptions.url
    next()
  })
}
