import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { readFile } from "fs/promises"
import sirv from "sirv"
import { AlbumStartContext } from "../../context/context.type.js"
import { AlbumServerExpressConfig } from "../middlewares/middlewares.type.js"
import { SSRComposeModule } from "../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"
import { createRewriter } from "./rewriteUrl.js"

export async function applySSRComposeStartMiddleware(app: INestApplication, context: AlbumStartContext, midConfigs: AlbumServerExpressConfig[]) {
  const { info, ssrComposeConfig, serverConfig } = context
  const { ssrCompose } = info
  if (!ssrCompose) return

  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { dependenciesInputs, projectInputs } = ssrComposeConfig
  const sirvConfig = midConfigs.find(v => v.name === "sirv")!
  const rewrite = createRewriter(serverConfig.rewrite)
  sirvConfig.factory = function proxyServerStaticFactory(_, sirvConfig: any) {
    projectInputs.forEach(value => {
      value.assetsService = sirv(value.clientInput, sirvConfig)
    })

    return async function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
      rewrite(req)
      const reqPath = req.path
      const dependencyInfo = dependenciesInputs.get(reqPath.slice(1))
      if (dependencyInfo) {
        const file = await readFile(dependencyInfo.filepath!, "utf-8")
        res.header("Content-Type", "application/javascript")
        res.send(file)
        return
      }

      const albumOptions = normalizeMidRequestOptions(req.originalUrl, projectInputs)
      const { prefix, url } = albumOptions
      const project = projectInputs.get(prefix)
      if (!project) return res.status(404).send("")

      req.albumOptions = albumOptions
      req.url = url
      return project.assetsService(req, res, next)
    }
  }
}
