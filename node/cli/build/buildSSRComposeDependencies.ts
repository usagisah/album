import { stringify } from "@ungap/structured-clone/json"
import { mkdir, readFile, rm, writeFile } from "fs/promises"
import { hasCJSSyntax } from "mlly"
import { resolve } from "path"
import { build as viteBuild } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"
import { SSRComposeDependency } from "../../ssrCompose/ssrCompose.start.type.js"
import { makeLegalIdentifier } from "../../utils/modules/makeLegalIdentifier.js"
import { resolveLibPath } from "../../utils/path/resolveLibPath.js"

export const SCDName = ".ssr-compose-dependencies"
export async function buildSSRComposeDependencies(context: AlbumContext): Promise<Map<string, SSRComposeDependency>> {
  const dependencies = context.ssrComposeManager!.dependencies
  if (dependencies.length === 0) return new Map()

  const { inputs, outputs } = context
  const { cwd } = inputs
  const { outDir } = outputs
  const depOutDir = resolve(outDir, SCDName)

  await rm(depOutDir, { force: true, recursive: true })
  await mkdir(depOutDir, { recursive: true })

  const ssrComposeDependenciesData = await Promise.all(dependencies.map(async libName => buildDependency(resolve(cwd, "node_modules", libName), depOutDir, dependencies)))
  const manifest = new Map<string, SSRComposeDependency>(ssrComposeDependenciesData)
  await writeFile(resolve(depOutDir, "manifest.json"), stringify(manifest), "utf-8")
  return manifest
}

async function buildDependency(libPath: string, depOutDir: string, external: string[]) {
  const pathInfo = await resolveLibPath(libPath)
  if (!pathInfo) throw `找不到该共享依赖(${libPath})的入口`

  const { refPath, refFullPath } = pathInfo
  const filename = makeLegalIdentifier(refPath)
  await viteBuild({
    logLevel: "error",
    build: {
      lib: { entry: refFullPath, formats: ["es"], fileName: filename },
      emptyOutDir: false,
      outDir: depOutDir,
      rollupOptions: { external },
      minify: true
    },
    define: { "process.env.NODE_ENV": `"production"` }
  })
  return [
    refPath,
    {
      filename: filename + ".js",
      filepath: "",
      cjs: hasCJSSyntax(await readFile(refFullPath, "utf-8"))
    }
  ] as const
}
