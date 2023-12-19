import { parse } from "@ungap/structured-clone/json"
import { existsSync, statSync } from "fs"
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { SSRComposeCoordinateInput, SSRComposeDependencies, SSRComposeStartProjectsInput } from "./ssrCompose.start.type.js"

export async function createSSRComposeManager(root: string) {
  const projectInputs: SSRComposeStartProjectsInput = new Map()
  const coordinateInputs: SSRComposeCoordinateInput = new Map()
  const dependenciesInputs: SSRComposeDependencies = new Map()

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
    projectInputs.set(_name, { clientInput, ssrInput, mainServerInput })

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
      const composeManifest: SSRComposeDependencies = parse(await readFile(resolve(depDirPath, "manifest.json"), "utf-8"))
      composeManifest.forEach((value, id) => {
        if (dependenciesInputs.has(id)) return
        value.filepath = resolve(depDirPath, value.filename)
        dependenciesInputs.set(id, value)
      })
    } catch {}
  }
  return { projectInputs, coordinateInputs, dependenciesInputs }
}
