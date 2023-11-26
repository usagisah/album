import { AlbumDevContext } from "../context/context.type.js"
import { initClient } from "./initClient.js"
import { patchClient } from "./patchClient.js"

const pageReg = /\.?(page|router|action)\.[a-z]+$/

export async function processClient(context: AlbumDevContext) {
  const { watcher } = context
  context.clientManager = await initClient(context)

  if (watcher) {
    const patch = async (p: string) => {
      if (pageReg.test(p)) await patchClient(context)
    }
    watcher.on("add", patch)
    watcher.on("unlink", patch)
    watcher.on("unlinkDir", () => patchClient(context))
  }
}
