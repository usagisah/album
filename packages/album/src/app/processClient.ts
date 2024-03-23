import { isBlank } from "@albumjs/tools/node"
import { AlbumContext } from "../context/context.dev.type.js"
import { initClient } from "./initClient.js"
import { patchClient } from "./patchClient.js"

export function processClient(context: AlbumContext) {
  const { appManager, watcher } = context
  const { pageFilter, routerFilter, actionFilter } = appManager.module
  const ready = initClient(context)

  if (watcher) {
    const filter = (type: string) => {
      const { modulePath } = context.appManager.module
      return (p: string) => {
        if (isBlank(modulePath) || !p.startsWith(modulePath)) {
          return
        }
        if (type === "unlinkDir" || pageFilter.test(p) || routerFilter.test(p) || actionFilter.test(p)) {
          patchClient(context, { type, path: p })
        }
      }
    }
    watcher.on("add", filter("add"))
    watcher.on("unlink", filter("unlink"))
    watcher.on("unlinkDir", filter("unlinkDir"))
    watcher.add(context.appManager.module.modulePath)
  }

  return { ready }
}
