import { Func, isBlank } from "@albumjs/tools/node"
import { parse } from "@ungap/structured-clone/json"
import { existsSync, statSync } from "fs"
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { CacheConfig } from "../context/context.start.type.js"
import { DEP_OUT_NAME } from "../ssrCompose/constants.js"
import { SSRComposeDependency, SSRComposeManager, SSRComposeProject } from "./ssrCompose.start.type.js"

export async function createModuleInfo(encodes: Func[], root?: string) {
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

    const _name = name.toLowerCase()
    const _projectInfo = {
      clientInput,
      clientManifest: {},
      mainClientInput: "",
      ssrInput,
      ssrManifest: {},
      ssrSSRManifest: {},
      mainServerInput: "",

      coordinate: {}
    }

    try {
      const _clientManifestFile = readFile(resolve(clientInput, ".vite/manifest.json"), "utf-8")
      const _ssrManifestFile = readFile(resolve(ssrInput, ".vite/manifest.json"), "utf-8")
      const _ssrSSRManifestFile = readFile(resolve(ssrInput, ".vite/ssr-manifest.json"), "utf-8")
      const _coordinateFile = readFile(resolve(clientInput, ".vite/coordinate.json"), "utf-8")
      const _composeManifest = readFile(resolve(root, name, ".ssr-compose-dependencies", "manifest.json"), "utf-8")
      const [clientManifestFile, ssrManifestFile, ssrSSRManifestFile, coordinateFile, depManifestFile] = await Promise.all([
        _clientManifestFile,
        _ssrManifestFile,
        _ssrSSRManifestFile,
        _coordinateFile,
        _composeManifest
      ])
      _projectInfo.ssrSSRManifest = JSON.parse(ssrSSRManifestFile)

      const clientManifestJson = (_projectInfo.clientManifest = JSON.parse(clientManifestFile))
      for (const key in clientManifestJson) {
        const v = clientManifestJson[key]
        if (v.isEntry) {
          _projectInfo.mainClientInput = resolve(clientInput, v.file)
          break
        }
      }

      const ssrManifestJson = (_projectInfo.ssrManifest = JSON.parse(ssrManifestFile))
      for (const key in ssrManifestJson) {
        const v = ssrManifestJson[key]
        if (v.isEntry) {
          _projectInfo.mainServerInput = resolve(ssrInput, v.file)
          break
        }
      }

      const coordinate = {}
      const coordinateJson = JSON.parse(coordinateFile)
      for (const key in coordinateJson) {
        encodes.forEach(transform => {
          try {
            const s = transform(key)
            if (!isBlank(s)) coordinate[s] = coordinateJson[key]
            else coordinate[key] = coordinateJson[key]
          } catch {}
        })
      }
      _projectInfo.coordinate = coordinateJson

      const depManifest: Map<string, SSRComposeDependency> = parse(depManifestFile)
      depManifest.forEach((value, id) => {
        if (dependenciesMap.has(id)) return
        value.filepath = resolve(root, name, DEP_OUT_NAME, value.filename)
        dependenciesMap.set(id, value)
      })
    } catch {
      continue
    }

    projectMap.set(_name, _projectInfo)
  }
  return res
}

export async function createSSRComposeManager(root: string, ssrComposeConfig: CacheConfig["ssrComposeConfig"]) {
  const { rewrites } = ssrComposeConfig
  const _rewrites: any = rewrites.map(str => new Function("p", `return (${str})(p)`))
  const { projectMap, dependenciesMap } = await createModuleInfo(_rewrites, root)
  const manager: SSRComposeManager = {
    projectMap,
    dependenciesMap
  }
  return manager
}
