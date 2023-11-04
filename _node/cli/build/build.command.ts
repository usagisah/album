import { AlbumServerParams } from "../cli.type.js"
import { albumBuild } from "./albumBuild.js"

export class BuildCommand {
  constructor(public params: AlbumServerParams) {
    this.start()
  }

  async start() {
    await albumBuild(this.params).catch((e: any) => {
      throw e
    })
    process.exit(0)
  }
}
