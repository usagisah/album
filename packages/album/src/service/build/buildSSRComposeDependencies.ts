import { cjsImporterToEsm, makeLegalIdentifier, resolveLibPath } from "@albumjs/tools/node"
import { stringify } from "@ungap/structured-clone/json"
import { existsSync } from "fs"
import { mkdir, readFile, rm, writeFile } from "fs/promises"
import { hasCJSSyntax } from "mlly"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { SSRComposeDependency } from "../../ssrCompose/ssrCompose.start.type.js"

interface DepModuleInfo {
  refPath: string
  refFullPath: string
  node_modules: string
  scope: string
  name: string
  subpath: string
  cjs: boolean
}

export const SCDName = ".ssr-compose-dependencies"
export async function buildSSRComposeDependencies(context: AlbumContext): Promise<Map<string, SSRComposeDependency>> {
  const dependencies = context.ssrComposeManager!.dependencies
  const { inputs, outputs } = context
  const { cwd, dumpInput } = inputs
  const { outDir } = outputs
  const depOutDir = resolve(outDir, SCDName)
  const alias = {
    album: resolve(dumpInput, "album.client.ts"),
    "album.server": resolve(dumpInput, "album.server.ts"),
    "album.dependency": resolve(dumpInput, "album.dependency.ts")
  }

  await rm(depOutDir, { force: true, recursive: true })
  await mkdir(depOutDir, { recursive: true })

  const cjsLibraries: string[] = []
  const libraryModuleInfo = await Promise.all<DepModuleInfo>(
    dependencies.map(async name => {
      const libNodeModulePath = resolve(cwd, "node_modules", name)
      const libEntryInfo = await resolveLibPath(libNodeModulePath)
      if (!libEntryInfo) {
        throw `找不到该共享依赖(${libNodeModulePath})的入口`
      }

      const cjs = hasCJSSyntax(await readFile(libEntryInfo.refFullPath, "utf-8"))
      if (cjs) {
        cjsLibraries.push(name)
      }
      return {
        name,
        cjs,
        ...libEntryInfo
      }
    })
  )

  const buildLocalDependency = async (filename: string, libPath: string) => {
    if (!existsSync(libPath)) {
      throw `找不到该共享依赖(${libPath})的入口`
    }
    await viteBuild({
      mode: "production",
      logLevel: "error",
      build: {
        lib: { entry: libPath, formats: ["es"], fileName: filename },
        emptyOutDir: false,
        outDir: depOutDir,
        rollupOptions: {
          external: [...dependencies, "album.dependency"]
        },
        minify: true
      },
      resolve: {
        alias
      },
      define: {
        "process.env.NODE_ENV": `"production"`
      }
    })

    await rewriteCjsImporter(resolve(depOutDir, filename + ".js"))

    return [
      filename,
      {
        filename: filename + ".js",
        filepath: "",
        cjs: false
      }
    ] as const
  }
  const buildLibraryDependency = async (info: DepModuleInfo) => {
    const { refPath, refFullPath, cjs } = info
    const filename = makeLegalIdentifier(refPath)
    await viteBuild({
      mode: "production",
      logLevel: "error",
      build: {
        lib: { entry: refFullPath, formats: ["es"], fileName: filename },
        emptyOutDir: false,
        outDir: depOutDir,
        rollupOptions: {
          external: [...dependencies, "album.dependency"]
        },
        minify: true
      },
      resolve: {
        alias
      },
      define: {
        "process.env.NODE_ENV": `"production"`
      }
    })

    const outfilePath = resolve(depOutDir, filename + ".js")
    let file = await readFile(outfilePath, "utf-8")
    let namespaceCount = 0
    file = file.replace(/import \* as (\w+) from ["']([^"']+)["']/g, (_, p1, p2) => {
      namespaceCount++
      return `import ${p1} from "${p2}";`
    })
    if (namespaceCount > 0) {
      await writeFile(outfilePath, file, "utf-8")
    }

    await rewriteCjsImporter(outfilePath)

    return [refPath, { filename: filename + ".js", filepath: "", cjs }] as const
  }
  const rewriteCjsImporter = async (filePath: string) => {
    if (cjsLibraries.length > 0) {
      const code = cjsImporterToEsm(await readFile(filePath, "utf-8"), cjsLibraries)
      await writeFile(filePath, code, "utf-8")
    }
  }

  const ssrComposeDependenciesData = await Promise.all([
    ...libraryModuleInfo.map(buildLibraryDependency),
    buildLocalDependency("album.dependency", resolve(dumpInput, "album.dependency.ts"))
  ])

  const manifest = new Map<string, SSRComposeDependency>(ssrComposeDependenciesData)
  await writeFile(resolve(depOutDir, "manifest.json"), stringify(manifest), "utf-8")
  return manifest
}
