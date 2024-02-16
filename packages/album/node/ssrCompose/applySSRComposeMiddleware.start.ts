import { INestApplication } from "@nestjs/common"
import { LazyModuleLoader } from "@nestjs/core"
import { NextFunction, Request, Response } from "express"
import { readFile } from "fs/promises"
import sirv from "sirv"
import { AlbumContext } from "../context/context.start.type.js"
import { AlbumServerExpressConfig } from "../middlewares/middlewares.type.js"
import { SSRComposeModule } from "../modules/ssr-compose/ssr-compose.module.js"
import { normalizeMidRequestOptions } from "./normalizeMidRequestOptions.js"

export async function applySSRComposeStartMiddleware(app: INestApplication, context: AlbumContext, midConfigs: AlbumServerExpressConfig[]) {
  await app.get(LazyModuleLoader).load(() => SSRComposeModule)

  const { ssrComposeManager } = context
  const { projectMap, dependenciesMap } = ssrComposeManager!
  const sirvConfig = midConfigs.find(v => v.name === "sirv")!
  sirvConfig.factory = function proxyServerStaticFactory(_, sirvConfig: any) {
    projectMap.forEach(value => {
      value.assetsService = sirv(value.clientInput, sirvConfig)
    })

    return async function proxyServerStaticMiddleware(req: Request, res: Response, next: NextFunction) {
      const reqPath = req.path
      const dependencyInfo = dependenciesMap.get(reqPath.slice(1))
      if (dependencyInfo) {
        const file = await readFile(dependencyInfo.filepath, "utf-8")
        res.header("Content-Type", "application/javascript")
        res.send(file)
        return
      }
      
      debugger
      const albumOptions = normalizeMidRequestOptions(req.originalUrl, projectMap)
      const { prefix, url } = albumOptions
      const project = projectMap.get(prefix)
      if (!project) return res.status(404).send("")

      req.albumOptions = albumOptions
      req.url = url
      return project.assetsService(req, res, next)
    }
  }
}
