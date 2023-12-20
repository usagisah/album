import { parse } from "@ungap/structured-clone/json"
import { existsSync, statSync } from "fs"
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { CacheConfig } from "../context/context.start.type.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { createPathRewriter } from "./pathRewriter.js"
import { SSRComposeCoordinate, SSRComposeCoordinateEvents, SSRComposeDependency, SSRComposeManager, SSRComposeProject, SSRComposeProjectEvents } from "./ssrCompose.start.type.js"

export async function createSSRComposeManager(root: string, ssrComposeConfig: CacheConfig["ssrComposeConfig"]) {
  const projectInputs = new Map<string, SSRComposeProject>()
  const coordinateInputs = new Map<string, SSRComposeCoordinate>()
  const dependenciesInputs = new Map<string, SSRComposeDependency>()
  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue

    const { name } = fileInfo
    if (name.startsWith(".")) continue

    const clientInput = resolve(root, name, "client")
    const ssrInput = resolve(root, name, "ssr")
    if (!existsSync(clientInput) || !statSync(clientInput).isDirectory() || !existsSync(ssrInput) || !statSync(ssrInput).isDirectory()) continue

    const mainServerInput = await resolveFilePath({ root: ssrInput, prefixes: ["./"], suffixes: ["main.ssr"] })
    if (!mainServerInput) continue

    const _name = name.toLowerCase()
    projectInputs.set(_name, { clientInput, ssrInput, mainServerInput, meta: new Map() })

    try {
      const [clientManifestFile, ssrManifestFile, coordinateFile] = await Promise.all([readFile(resolve(clientInput, ".vite/manifest.json"), "utf-8"), readFile(resolve(ssrInput, ".vite/ssr-manifest.json"), "utf-8"), readFile(resolve(root, name, "coordinate.json"), "utf-8")])
      coordinateInputs.set(_name, {
        manifest: JSON.parse(clientManifestFile),
        ssrManifest: JSON.parse(ssrManifestFile),
        coordinate: JSON.parse(coordinateFile)
      })
    } catch {
      continue
    }

    try {
      const depDirPath = resolve(root, name, ".ssr-compose-dependencies")
      const composeManifest: Map<string, SSRComposeDependency> = parse(await readFile(resolve(depDirPath, "manifest.json"), "utf-8"))
      composeManifest.forEach((value, id) => {
        if (dependenciesInputs.has(id)) return
        value.filepath = resolve(depDirPath, value.filename)
        dependenciesInputs.set(id, value)
      })
    } catch {}
  }

  const dependenciesMap = {}
  dependenciesInputs.forEach((_, id) => (dependenciesMap[id] = `/${id}`))

  const { rewrites } = ssrComposeConfig
  const _rewrites = rewrites.map(sFn => new Function("req", `return (${sFn})(req)`))

  const rewriter = createPathRewriter(_rewrites as any)
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
    rewriter,
    coordinate,
    project,
    getDependencies: () => dependenciesInputs,
    getImporterMap: () => dependenciesMap
  }
  return manager
}
