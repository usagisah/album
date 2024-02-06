import { AlbumContext } from "../context/context.dev.type.js"
import { initClient } from "./initClient.js"
import { patchClient } from "./patchClient.js"

const pageReg = /\.?(page|router|action)\.[a-z]+$/

export async function processClient(context: AlbumContext) {
  const { watcher } = context
  await initClient(context)

  if (watcher) {
    const patch = (p: string) => {
      if (pageReg.test(p)) patchClient(context)
    }
    watcher.on("add", patch)
    watcher.on("unlink", patch)
    watcher.on("unlinkDir", () => patchClient(context))
  }
}
