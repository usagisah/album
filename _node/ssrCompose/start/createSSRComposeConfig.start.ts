import { existsSync, statSync } from "fs"
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { CacheSSRCompose } from "../../context/context.type.js"
import { resolveFilePath } from "../../utils/path/resolvePath.js"
import { SSRComposeCoordinateInput, SSRComposeDependencies, SSRComposeStartProjectsInput } from "../ssrCompose.type.js"

export async function createSSRComposeConfig(root: string, cacheSSRCompose: CacheSSRCompose) {
  const projectInputs: SSRComposeStartProjectsInput = new Map()
  const coordinateInputs: SSRComposeCoordinateInput = new Map()
  const dependenciesInputs: SSRComposeDependencies = new Map()

  for (const fileInfo of await readdir(root, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue

    const { name } = fileInfo
    const clientInput = resolve(root, name, "client")
    const ssrInput = resolve(root, name, "ssr")
    if (!existsSync(clientInput) || !statSync(clientInput).isDirectory() || !existsSync(ssrInput) || !statSync(ssrInput).isDirectory()) continue

    const mainServerInput = await resolveFilePath({ root: ssrInput, prefixes: ["./"], suffixes: ["main.ssr"] })
    if (!mainServerInput) continue

    try {
      const _dependencies = JSON.parse(await readFile(resolve(root, name, ".ssr-compose-dependencies/manifest.json"), "utf-8"))
      for (const key in _dependencies) {
        if (Reflect.has(dependenciesInputs, key)) continue
        dependenciesInputs[key] = _dependencies[key]
      }
    } catch {}

    const _name = name.toLowerCase()
    projectInputs.set(_name, { clientInput, ssrInput, mainServerInput })

    const [clientManifestFile, ssrManifestFile, coordinateFile] = await Promise.all([readFile(resolve(root, name, "client/manifest.json"), "utf-8"), readFile(resolve(root, name, "server/ssr-manifest.json"), "utf-8"), readFile(resolve(root, name, "coordinate.json"), "utf-8")])
    coordinateInputs.set(_name, {
      manifest: JSON.parse(clientManifestFile),
      ssrManifest: JSON.parse(ssrManifestFile),
      coordinate: JSON.parse(coordinateFile)
    })
  }
  return { projectInputs, coordinateInputs, dependenciesInputs }
}
