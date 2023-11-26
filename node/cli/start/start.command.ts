import { albumStartServer } from "./start.js"

export class StartCommand {
  constructor() {
    this.start()
  }

  async start() {
    albumStartServer().catch((e: any) => {
      throw e
    })
  }
}
