import { stringify } from "@ungap/structured-clone/json"
import { readFileSync } from "fs"
import { mkdir, rm, writeFile } from "fs/promises"
import { hasCJSSyntax } from "mlly"
import { basename, parse, resolve } from "path"
import { build as viteBuild } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { resolveLibPath } from "../../utils/path/resolveLibPath.js"

export async function buildSSRComposeDependencies(context: AlbumDevContext) {
  const _dependencies = context.userConfig!.ssrCompose!.dependencies!
  const { inputs, outputs } = context.info
  const { cwd } = inputs
  const { ssrOutDir } = outputs
  const outDir = resolve(ssrOutDir!, "../.ssr-compose-dependencies")

  await rm(outDir, { force: true, recursive: true })
  await mkdir(outDir, { recursive: true })

  const dependencies = [...new Set(_dependencies)]
  const ssrComposeDependenciesData = await Promise.all(dependencies.map(async libName => buildDependency(resolve(cwd, "node_modules", libName), outDir, dependencies)))
  const ssrComposeDependencies: SSRComposeDependencies = new Map(ssrComposeDependenciesData)
  await writeFile(resolve(outDir, "manifest.json"), stringify(ssrComposeDependencies), "utf-8")
  return ssrComposeDependencies
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
