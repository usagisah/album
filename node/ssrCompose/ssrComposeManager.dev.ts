import { readdir } from "fs/promises"
import { dirname } from "path"
import { AppManager } from "../app/app.dev.type.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { UserSSRCompose } from "../user/user.dev.type.js"
import { SSRComposeManager, SSRComposeProjectInputs } from "./ssrCompose.dev.type.js"

type SSRComposeConfigParams = {
  appManager: AppManager
  userConfigSSRCompose?: UserSSRCompose
  logger: ILogger
}

export async function createSSRComposeManager({ userConfigSSRCompose, appManager, logger }: SSRComposeConfigParams) {
  if (!userConfigSSRCompose) return null
  const { castExtensions, refPaths, dependencies } = userConfigSSRCompose

  const { modulePath, ignore } = appManager.module
  const projectInputs: SSRComposeProjectInputs = new Map()
  const root = dirname(modulePath)
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue
    const { name } = fileInfo
    if (ignore.some(t => t.test(name))) continue
    projectInputs.set(name.toLowerCase(), { type: "local" })
  }

  const manager: SSRComposeManager = {
    dependencies: dependencies ? [...new Set(dependencies)] : [],
    castExtensions: castExtensions ? [...new Set(castExtensions)] : []
  }

  // if (refPaths) {
  //   try {
  //     const res = await Promise.all(refPaths.map(createStartConfig))
  //     res.forEach(({ projectInputs, coordinateInputs }) => {

  //     })
  //   } catch (e) {
  //     logger.error(e, "album")
  //   }
  // }

  return manager
}
