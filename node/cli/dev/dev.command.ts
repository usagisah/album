import { DevServerParams } from "../cli.type.js"
import { albumDevServer } from "./dev.js"

export class DevCommand {
  cwd = process.cwd()

  constructor(public params: DevServerParams) {
    this.start()
  }

  start() {
    return albumDevServer(this.params).catch((e: any) => {
      throw e
    })
  }
}
