import { AlbumContext } from "../context/context.dev.type.js"
import { initClient } from "./initClient.js"
import { patchClient } from "./patchClient.js"

const specialModuleReg = /\.?(page|router|action)\.[a-z]+$/

export async function processClient(context: AlbumContext) {
  const { watcher } = context
  context.clientManager.ready = initClient(context)

  if (watcher) {
    const filter = (type: string) => {
      const { modulePath } = context.appManager.module
      return (p: string) => {
        if (!p.startsWith(modulePath)) {
          return
        }
        if (type === "unlinkDir" || specialModuleReg.test(p)) {
          patchClient(context)
        }
      }
    }
    watcher.on("add", filter("add"))
    watcher.on("unlink", filter("unlink"))
    watcher.on("unlinkDir", filter("unlinkDir"))
    watcher.add(context.appManager.module.modulePath)
  }
}
