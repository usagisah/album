import { FSWatcher } from "@albumjs/tools/lib/chokidar"
import { Func, isBlank } from "@albumjs/tools/node"
import { existsSync } from "fs"
import { readdir } from "fs/promises"
import { dirname, parse, sep } from "path"
import { UserConfig, mergeConfig, build as viteBuild } from "vite"
import { AlbumContext } from "../context/context.dev.type.js"
import { ILogger } from "../logger/logger.type.js"
import { resolveAlbumViteConfig } from "../middlewares/resolveMiddlewareConfig.js"
import { SSRComposeBuild, SSRComposeCoordinate, SSRComposeManager, SSRComposeProject, SSRComposeRewrite } from "./ssrCompose.dev.type.js"
import { SSRComposeProject as StartProject } from "./ssrCompose.start.type.js"
import { createModuleInfo } from "./ssrComposeManager.start.js"

export async function createSSRComposeManager(context: AlbumContext) {
  const { inputs, appManager, userConfig, watcher, logger } = context
  const userConfigSSRCompose = userConfig.ssrCompose

  if (!userConfigSSRCompose) return null
  const { castExtensions, startRoot, rewrites, dependencies } = userConfigSSRCompose

  const _castExtensions: string[] = [".ts", ".tsx", ".js", ".jsx"]
  for (const item of castExtensions ? [...new Set(castExtensions)] : []) {
    _castExtensions.push(item.startsWith(".") ? item : `.${item}`)
  }

  const _startRoot = startRoot ? `${inputs.cwd}${sep}${startRoot}` : ""
  const _dependencies = dependencies ? [...new Set(dependencies)] : []

  const _rewrites: SSRComposeRewrite = { encode: [], decode: [] }
  for (const { encode, decode } of rewrites ?? []) {
    _rewrites.encode.push(encode)
    _rewrites.decode.push(decode)
  }

  const projectMap: Map<string, SSRComposeProject | StartProject> = (await createModuleInfo(_rewrites.encode, _startRoot)).projectMap
  const { modulePath, ignore } = appManager.module
  const localModuleRoot = dirname(modulePath)
  for (const fileInfo of await readdir(localModuleRoot, { withFileTypes: true })) {
    if (!fileInfo.isDirectory()) continue

    const { name } = fileInfo
    if (ignore.some(t => t.test(name))) continue

    const coordinate: SSRComposeCoordinate = {}
    projectMap.set(name.toLowerCase(), {
      local: true,
      coordinate: new Proxy(coordinate, {
        get(_, p: string) {
          _rewrites.decode.forEach(transform => {
            try {
              const s = transform(p)
              if (!isBlank(s)) p = s
            } catch {}
          })
          let res = coordinate[p]
          if (res) return res

          const filepath = `${localModuleRoot}${sep}${p}`
          if (!existsSync(filepath)) return null
          return (coordinate[p] = { filepath, changed: false })
        }
      })
    })
  }

  const watch = createModuleWatcher(watcher, logger)
  const build: SSRComposeBuild = async ({ coordinate, input, outDir }) => {
    const ids: string[] = []
    try {
      await viteBuild(
        mergeConfig(resolveAlbumViteConfig(context), {
          mode: "development",
          logLevel: "error",
          plugins: [
            {
              name: "album:ssr-compose-collect",
              buildEnd(error) {
                if (error) return
                for (const id of Array.from(this.getModuleIds())) {
                  if (!id.startsWith("/")) continue
                  if (id.includes("node_modules")) continue
                  ids.push(id)
                }
              }
            }
          ],
          build: {
            manifest: true,
            minify: false,
            cssMinify: false,
            rollupOptions: {
              input,
              external: [..._dependencies, /^album/]
            },
            lib: {
              entry: input,
              formats: ["es"],
              fileName: parse(input).name
            },
            outDir,
            cssCodeSplit: false
          }
        } as UserConfig)
      )
      watch(input, ids, () => (coordinate.changed = true))
      coordinate.changed = false
      ids.length = 0
    } catch {}
  }

  const manager: SSRComposeManager = {
    dependencies: _dependencies,
    castExtensions: _castExtensions,
    rewrites: _rewrites,
    startRoot: _startRoot,
    projectMap,
    build
  }
  return manager
}

function createModuleWatcher(watcher: FSWatcher, logger: ILogger) {
  const info = new Map<string, { depWatches: Func[] }>()
  const coordinate = new Map<string, Set<string>>()
  const onChange = (path: string) => {
    for (const input of coordinate.get(path)!) {
      info.get(input)!.depWatches.forEach(f => f())
    }
    logger.log(`changed: ${path}`, "ssr-compose")
  }
  watcher.on("change", onChange)
  watcher.on("unlink", onChange)
  return function watch(input: string, ids: string[], onChange: Func) {
    if (info.has(input)) return
    for (const id of ids) {
      const inputs = coordinate.get(id)
      if (inputs) inputs.add(input)
      else coordinate.set(id, new Set([input]))
    }
    info.set(input, { depWatches: [onChange] })
    watcher.add(ids)
    return
  }
}
