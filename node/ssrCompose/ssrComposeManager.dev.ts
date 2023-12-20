import { readdir } from "fs/promises"
import { dirname } from "path"
import { AppManager } from "../app/app.dev.type.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { UserSSRCompose } from "../user/user.dev.type.js"
import { isArray, isFunction } from "../utils/check/simple.js"
import { createPathRewriter } from "./pathRewriter.js"
import { SSRComposeCoordinateEvents, SSRComposeManager, SSRComposeProject, SSRComposeProjectEvents, SSRComposeRewrite } from "./ssrCompose.dev.type.js"

type SSRComposeConfigParams = {
  appManager: AppManager
  userConfigSSRCompose?: UserSSRCompose
  logger: ILogger
}

export async function createSSRComposeManager({ userConfigSSRCompose, appManager, logger }: SSRComposeConfigParams) {
  if (!userConfigSSRCompose) return null
  const { castExtensions, refPaths, rewrites, dependencies } = userConfigSSRCompose

  const { modulePath, ignore } = appManager.module
  const projectInputs = new Map<string, SSRComposeProject>()
  const root = dirname(modulePath)
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue
    const { name } = fileInfo
    if (ignore.some(t => t.test(name))) continue
    projectInputs.set(name.toLowerCase(), { type: "local", meta: new Map() })
  }

  const _castExtensions: string[] = [".ts", ".tsx", ".js", ".jsx"]
  for (const item of castExtensions ? [...new Set(castExtensions)] : []) {
    _castExtensions.push(item.startsWith(".") ? item : `.${item}`)
  }

  const _rewrites: SSRComposeRewrite[] = []
  if (rewrites && !isArray(rewrites)) _rewrites.push(rewrites)
  for (const rule of rewrites ?? []) {
    if (isFunction(rule)) _rewrites.push(rule)
    else {
      for (const key in rule) {
        _rewrites.push(new Function("req", `const {path}=req;if(path===${key})return ${rule[key]}`) as any)
      }
    }
  }

  const rewriter = createPathRewriter(_rewrites)
  const coordinate: SSRComposeCoordinateEvents = {
    get(path) {
      return coordinate.get(path)
    }
  }
  const project: SSRComposeProjectEvents = {
    get(prefix) {
      const res = projectInputs.get(prefix)
      if (!res) return null

      const { meta, ...result } = res
      return result
    },
    has(prefix) {
      return projectInputs.has(prefix)
    },
    getMetaData(prefix, key) {
      if (!projectInputs.has(prefix)) return null
      return projectInputs.get(key)!.meta.get(key)
    },
    setMetaData(prefix, key, value) {
      if (!projectInputs.has(prefix)) return false
      const { meta } = projectInputs.get(key)!
      if (!meta.has(key)) return false
      meta.set(key, value)
      return true
    }
  }

  const manager: SSRComposeManager = {
    dependencies: dependencies ? [...new Set(dependencies)] : [],
    castExtensions: _castExtensions,
    rewrites: _rewrites,
    coordinate,
    project,
    rewriter
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
