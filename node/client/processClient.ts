import { AlbumContext } from "../context/AlbumContext.js"
import { ClientManager } from "./client.type.js"
import { initClient } from "./initClient/initClient.js"
import { patchClient } from "./patchClient/patchClient.js"

const pageReg = /\.?(page|router|action)\.[a-z]+$/

export async function processClient(context: AlbumContext) {
  const { serverMode, watcher } = context

  if (serverMode === "start") return

  const clientManager: ClientManager = { specialModules: [] }
  await initClient(context, clientManager)

  if (context.watcher) {
    watcher.on("add", async path => {
      if (pageReg.test(path)) {
        await patchClient(context, clientManager)
      }
    })
    watcher.on("unlink", async path => {
      if (pageReg.test(path)) {
        await patchClient(context, clientManager)
      }
    })
    watcher.on("unlinkDir", async () => {
      await patchClient(context, clientManager)
    })
  }

  context.manager.clientManager = clientManager
}
