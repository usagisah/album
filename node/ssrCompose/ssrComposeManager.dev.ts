import { FSWatcher } from "chokidar"
import { existsSync } from "fs"
import { readdir } from "fs/promises"
import { dirname, parse, sep } from "path"
import { UserConfig, mergeConfig, build as viteBuild } from "vite"
import { AppManager } from "../app/app.dev.type.js"
import { AlbumUserConfig, UserSSRCompose } from "../user/user.dev.type.js"
import { isArray, isFunction } from "../utils/check/simple.js"
import { Func } from "../utils/types/types.js"
import { createPathRewriter } from "./pathRewriter.js"
import { SSRComposeBuild, SSRComposeCoordinate, SSRComposeManager, SSRComposeProject, SSRComposeRewrite } from "./ssrCompose.dev.type.js"
import { SSRComposeProject as StartProject } from "./ssrCompose.start.type.js"
import { createModuleInfo } from "./ssrComposeManager.start.js"

type SSRComposeConfigParams = {
  watcher: FSWatcher
  appManager: AppManager
  userConfigSSRCompose?: UserSSRCompose
  userConfig: AlbumUserConfig
}

export async function createSSRComposeManager({ userConfigSSRCompose, appManager, userConfig, watcher }: SSRComposeConfigParams) {
  if (!userConfigSSRCompose) return null
  const { castExtensions, startRoot, rewrites, dependencies } = userConfigSSRCompose

  const _castExtensions: string[] = [".ts", ".tsx", ".js", ".jsx"]
  for (const item of castExtensions ? [...new Set(castExtensions)] : []) {
    _castExtensions.push(item.startsWith(".") ? item : `.${item}`)
  }

  const _rewrites: SSRComposeRewrite[] = []
  if (rewrites && !isArray(rewrites)) _rewrites.push(rewrites)
  for (const rule of rewrites ?? []) {
    if (isFunction(rule)) _rewrites.push(rule)
    else {
      for (const key in rule) {
        _rewrites.push(new Function("req", `const {path}=req;if(path===${key})return ${rule[key]}`) as any)
      }
    }
  }
  const rewriter = createPathRewriter(_rewrites)

  const _dependencies = dependencies ? [...new Set(dependencies)] : []

  const projectMap: Map<string, SSRComposeProject | StartProject> = (await createModuleInfo(rewriter, startRoot)).projectMap
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
        get(target, p: string, receiver) {
          if (Reflect.has(target, p)) return Reflect.get(target, p, receiver)
          const filepath = `${localModuleRoot}${sep}${p}`
          if (!existsSync(filepath)) return null
          return (coordinate[p] = { filepath, changed: false })
        }
      })
    })
  }

  const watch = createModuleWatcher(watcher)
  const build: SSRComposeBuild = async ({ coordinate, input, outDir }) => {
    const ids: string[] = []
    try {
      await viteBuild(
        mergeConfig(userConfig.vite ?? {}, {
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
              external: [/node_modules/, ..._dependencies]
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
    } catch {}
  }

  const manager: SSRComposeManager = {
    dependencies: _dependencies,
    castExtensions: _castExtensions,
    rewrites: _rewrites,
    rewriter,
    projectMap,
    build
  }
  return manager
}

function createModuleWatcher(watcher: FSWatcher) {
  const counter = new Map<string, number>()
  const deps = new Map<string, { ids: string[] }>()
  const decrease = (input: string) => {
    const { ids } = deps.get(input)!
    for (const id of ids) {
      if (!counter.has(id)) continue

      const n = counter.get(id)! - 1
      if (n <= 0) counter.delete(id)
      else counter.set(id, n)
    }
    deps.delete(input)
    watcher.unwatch(ids)
  }
  const increase = (input: string, ids: string[]) => {
    for (const id of ids) {
      counter.set(id, (counter.get(id) ?? 0) + 1)
    }
    deps.set(input, { ids })
    watcher.add(ids)
  }
  return function watch(input: string, ids: string[], onChange: Func) {
    if (deps.has(input)) decrease(input)
    increase(input, ids)

    const _onChange = () => {
      watcher.removeListener("change", _onChange)
      watcher.removeListener("unlink", _onChange)

      if (!deps.has(input)) return
      decrease(input)
      onChange()
    }
    watcher.on("change", _onChange)
    watcher.on("unlink", _onChange)
  }
}
