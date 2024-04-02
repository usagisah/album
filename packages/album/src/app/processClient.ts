import { AlbumContext } from "../context/context.dev.type.js"
import { initClient } from "./initClient.js"
import { patchClient } from "./patchClient.js"

export function processClient(context: AlbumContext) {
  const { appManager, pluginManager, watcher } = context
  const { modules } = appManager
  if (modules.length === 0) {
    return { ready: Promise.resolve() }
  }

  const ready = initClient(context)
  if (watcher) {
    const filter = (type: string) => {
      return (p: string) => {
        if (pluginManager.getSize("patchClient") === 0) {
          return
        }
        const m = modules.find(m => p.startsWith(m.modulePath))
        if (!m) {
          return
        }
        const { pageFilter, routerFilter, actionFilter } = m
        if (type === "unlinkDir" || pageFilter.test(p) || routerFilter.test(p) || actionFilter.test(p)) {
          patchClient(context, { type, path: p })
        }
      }
    }
    watcher.add(modules.map(m => m.modulePath).filter(Boolean))
    watcher.on("add", filter("add"))
    watcher.on("unlink", filter("unlink"))
    watcher.on("unlinkDir", filter("unlinkDir"))
  }

  return { ready }
}
