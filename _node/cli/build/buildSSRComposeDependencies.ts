import { existsSync, readFileSync, writeFileSync } from "fs"
import { mkdir, rm } from "fs/promises"
import { basename, parse, resolve } from "path"
import { Package, exports } from "resolve.exports"
import { build as viteBuild } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { isString } from "../../utils/check/simple.js"
import { analysisCjsModule } from "./analysisCjsModule.js"

type DependenciesList = {
  params: { moduleName: string; subModuleName: string; fullModuleName: string }[]
  external: string[]
  outDir: string
  context: AlbumDevContext
}

export async function buildSSRComposeDependencies(context: AlbumDevContext) {
  const dependencies = context.userConfig!.ssrCompose!.dependencies!
  const { inputs, outputs } = context.info
  const { ssrOutDir } = outputs
  const ssrComposeDependencies: SSRComposeDependencies = {}
  const outDir = resolve(ssrOutDir!, "../.ssr-compose-dependencies")

  await rm(outDir, { force: true, recursive: true })
  await mkdir(outDir, { recursive: true })

  const list: DependenciesList = { external: [], params: [], context, outDir }
  const existed = (d: string) => list.external.some(v => v === d)
  for (const item of dependencies) {
    if (isString(item)) {
      if (existed(item)) continue

      list.external.push(item)
      list.params.push({ moduleName: item, subModuleName: "", fullModuleName: item })
    } else {
      for (const moduleName of Object.getOwnPropertyNames(item)) {
        for (const subModuleName of Object.getOwnPropertyNames(item[moduleName])) {
          const fullModuleName = moduleName + "/" + subModuleName
          if (existed(fullModuleName)) continue

          list.external.push(fullModuleName)
          list.params.push({ moduleName, subModuleName: "/" + subModuleName, fullModuleName })
        }
      }
    }
  }

  await Promise.all(list.params.map(async (_, index) => buildDependency(list, index, ssrComposeDependencies)))
  writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(ssrComposeDependencies), "utf-8")
}

function findExports(pkg: Package, module: string) {
  let value: string | undefined
  try {
    const res = exports(pkg, module)
    if (res) value = res[0]
  } catch {}
  if (!value) value = pkg.module
  if (!value) value = pkg.main
  if (value && value.startsWith("/")) value = "." + value
  return value
}

async function buildDependency(list: DependenciesList, index: number, ssrComposeDependencies: SSRComposeDependencies) {
  const { context, outDir, external, params } = list
  const { moduleName, subModuleName, fullModuleName } = params[index]

  const { cwd } = context.info.inputs
  const pkgPath = resolve(cwd, "node_modules", moduleName, "package.json")

  if (Reflect.has(ssrComposeDependencies, fullModuleName)) return
  if (!existsSync(pkgPath)) throw `找不到 ssrCompose.${fullModuleName} 的依赖，请确保配置合法，并正确添加依赖`

  const pkg: Package = JSON.parse(readFileSync(pkgPath, "utf-8"))
  const entryPath = findExports(pkg, subModuleName.slice(1))
  const fullEntryPath = resolve(cwd, "node_modules", moduleName, entryPath)
  if (!entryPath || !existsSync(fullEntryPath)) throw `找不到 ssrCompose.${fullModuleName} 的依赖入口，请联系库作者解决`

  const outfile = resolve(outDir, fullModuleName.replace("/", "_") + ".js")
  await viteBuild({
    logLevel: "error",
    build: {
      lib: {
        entry: fullEntryPath,
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
  ssrComposeDependencies[fullModuleName] = {
    filename: basename(outfile),
    filepath: outfile,
    isCjs: analysisCjsModule(readFileSync(fullEntryPath, "utf-8"))
  }
}
