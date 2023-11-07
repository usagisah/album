import { readFileSync } from "fs"
import { mkdir, rm } from "fs/promises"
import { hasCJSSyntax } from "mlly"
import { basename, parse, resolve } from "path"
import { build as viteBuild } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"
import { resolveLibPath } from "../../utils/path/resolveLibPath.js"

export async function buildSSRComposeDependencies(context: AlbumDevContext) {
  const _dependencies = context.userConfig!.ssrCompose!.dependencies!
  const { inputs, outputs } = context.info
  const { cwd } = inputs
  const { outDir } = outputs
  const depOutDir = resolve(outDir!, ".ssr-compose-dependencies")

  await rm(depOutDir, { force: true, recursive: true })
  await mkdir(depOutDir, { recursive: true })

  const dependencies = [...new Set(_dependencies)]
  const ssrComposeDependenciesData = await Promise.all(dependencies.map(async libName => buildDependency(resolve(cwd, "node_modules", libName), depOutDir, dependencies)))
  return new Map(ssrComposeDependenciesData)
}

async function buildDependency(libPath: string, outDir: string, external: string[]) {
  const pathInfo = await resolveLibPath(libPath)
  if (!pathInfo) throw `找不到该共享依赖(${libPath})的入口`

  const { refPath, refFullPath } = pathInfo
  const outfile = resolve(outDir, refPath.replace("/", "_") + ".js")
  await viteBuild({
    logLevel: "error",
    build: {
      lib: {
        entry: refFullPath,
        formats: ["es"],
        fileName: parse(outfile).name
      },
      emptyOutDir: false,
      outDir,
      rollupOptions: {
        external
      },
      minify: true
    },
    define: { "process.env.NODE_ENV": `"production"` }
  })
  return [
    refPath,
    {
      filename: basename(outfile),
      filepath: outfile,
      isCjs: hasCJSSyntax(readFileSync(refPath, "utf-8"))
    }
  ] as const
}
