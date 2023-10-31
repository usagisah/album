import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { basename, parse, resolve } from "path"
import { Package, exports } from "resolve.exports"
import { build as viteBuild } from "vite"
import { AlbumContext, SSRComposeDependencies } from "../../context/AlbumContext.type.js"
import { isString } from "../../utils/utils.js"
import { analysisCjsModule } from "./analysisCjsModule.js"

type DependenciesList = {
  external: string[]
  props: { moduleName: string; subModuleName: string; fullModuleName: string }[]
  outDir: string
  context: AlbumContext
}

export async function buildSSRComposeDependencies(context: AlbumContext) {
  const { dependencies } = context.configs.userConfig?.ssrCompose
  if (!dependencies) return

  const { inputs, outputs } = context
  const { ssrOutDir } = outputs
  const ssrComposeDependencies: SSRComposeDependencies = (inputs.ssrComposeDependencies = {})
  const outDir = resolve(ssrOutDir, "../.ssr-compose-dependencies")
  rmSync(outDir, { force: true, recursive: true })
  mkdirSync(outDir, { recursive: true })

  const list: DependenciesList = {
    external: [],
    props: [],
    context,
    outDir
  }
  for (const item of dependencies) {
    if (isString(item)) {
      list.external.push(item)
      list.props.push({ moduleName: item, subModuleName: "", fullModuleName: item })
    } else {
      for (const moduleName of Object.getOwnPropertyNames(item)) {
        for (const subModuleName of Object.getOwnPropertyNames(item[moduleName])) {
          const fullModuleName = moduleName + "/" + subModuleName
          list.external.push(fullModuleName)
          list.props.push({ moduleName, subModuleName: "/" + subModuleName, fullModuleName })
        }
      }
    }
  }

  await Promise.all(list.props.map(async (_, index) => buildDependency(list, index)))
  writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(ssrComposeDependencies), "utf-8")
}

function findExports(pkg: Package, module: string) {
  let value: string
  try {
    const res = exports(pkg, module)
    if (res) value = res[0]
  } catch {}
  if (!value) value = pkg.module
  if (!value) value = pkg.main
  if (value.startsWith("/")) value = "." + value
  return value
}

async function buildDependency(list: DependenciesList, index: number) {
  const { context, outDir, external, props } = list
  const { moduleName, subModuleName, fullModuleName } = props[index]

  const { cwd, ssrComposeDependencies } = context.inputs
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
      minify: false
    },
    define: { "process.env.NODE_ENV": `"production"` }
  })
  ssrComposeDependencies[fullModuleName] = {
    filename: basename(outfile),
    filepath: outfile,
    isCjs: analysisCjsModule(readFileSync(fullEntryPath, "utf-8"))
  }
}
