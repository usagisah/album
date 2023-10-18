import type { AlbumServerParams } from "../cli.type.js"
import { albumStartServer } from "./start.js"

export class StartCommand {
  constructor(public params: AlbumServerParams) {
    this.start()
  }

  async start() {
    albumStartServer(this.params).catch((e: any) => {
      throw e
    })
  }
}