import { parse } from "@ungap/structured-clone/json"
import { existsSync, statSync } from "fs"
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { CacheConfig } from "../context/context.start.type.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { Func } from "../utils/types/types.js"
import { createPathRewriter } from "./pathRewriter.js"
import { SSRComposeDependency, SSRComposeManager, SSRComposeProject } from "./ssrCompose.start.type.js"

export async function createModuleInfo(rewriter: Func, root?: string) {
  const projectMap = new Map<string, SSRComposeProject>()
  const dependenciesMap = new Map<string, SSRComposeDependency>()
  const res = { projectMap, dependenciesMap }
  if (!root) return res

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
    const _projectInfo = {
      clientInput,
      clientManifest: {},
      ssrInput,
      ssrManifest: {},

      mainServerInput,
      coordinate: {}
    }
    projectMap.set(_name, _projectInfo)

    try {
      const depPath = resolve(root, name, ".ssr-compose-dependencies")
      const _clientManifestFile = readFile(resolve(clientInput, ".vite/manifest.json"), "utf-8")
      const _ssrManifestFile = readFile(resolve(ssrInput, ".vite/ssr-manifest.json"), "utf-8")
      const _coordinateFile = readFile(resolve(clientInput, ".vite/coordinate.json"), "utf-8")
      const _composeManifest = readFile(resolve(depPath, "manifest.json"), "utf-8")

      const [clientManifestFile, ssrManifestFile, coordinateFile, depManifestFile] = await Promise.all([_clientManifestFile, _ssrManifestFile, _coordinateFile, _composeManifest])
      _projectInfo.clientManifest = JSON.parse(clientManifestFile)
      _projectInfo.ssrManifest = JSON.parse(ssrManifestFile)
      _projectInfo.coordinate = JSON.parse(coordinateFile)

      const depManifest: Map<string, SSRComposeDependency> = parse(depManifestFile)
      depManifest.forEach((value, id) => {
        if (dependenciesMap.has(id)) return
        value.filepath = resolve(clientInput, value.filename)
        dependenciesMap.set(id, value)
      })
    } catch {
      continue
    }
  }
  return res
}

export async function createSSRComposeManager(root: string, ssrComposeConfig: CacheConfig["ssrComposeConfig"]) {
  const { rewrites } = ssrComposeConfig
  const _rewrites = rewrites.map(sFn => new Function("req", `return (${sFn})(req)`))

  const rewriter = createPathRewriter(_rewrites as any)
  const { projectMap, dependenciesMap } = await createModuleInfo(rewriter, root)
  const manager: SSRComposeManager = {
    rewriter,
    projectMap,
    dependenciesMap
  }
  return manager
}
