import { existsSync, mkdirSync, writeFileSync } from "fs"
import { resolve } from "path"
import { AlbumServerParams } from "../cli.type.js"
import { albumDevServer } from "./dev.js"

export class DevCommand {
  cwd = process.cwd()

  constructor(public params: AlbumServerParams) {
    this.start()
  }

  async start() {
    albumDevServer(this.params).catch((e: any) => {
      throw e
    })
  }

  async ensureDumpRoot() {
    const dumpRoot = resolve(this.cwd, ".album")
    if (!existsSync(dumpRoot)) {
      mkdirSync(dumpRoot)
    }
  }

  async createPlaceholderEntry() {
    const { app } = this.params
    const entry = resolve(this.cwd, "album.bootStrap.js")
    writeFileSync(entry, `import { devServerBootStrap } from "album/cli";\ndevServerBootStrap({ app: "${app}" });`, "utf-8")
  }
}

// const { createWebpackConfig } = require("../configs/webpack.config.js")
// const webpack = require("webpack")
// const output = resolve(albumDir, "album.runtime.js")
// const configuration = createWebpackConfig({
//   mode: "development",
//   entry,
//   output,
//   lib: false
// })
// const compiler = webpack(configuration)
// let childProcessRef
// onSystemQuit(() => {
//   childProcessRef?.kill()
// })

// console.clear()
// logger.log("starting...", "album")
// startWatch()

// function startWatch() {
//   childProcessRef?.kill()
//   const watcher = compiler.watch({}, async (err, stats) => {
//     if (err && !stats) {
//       logger.error(err, "album")
//       childProcessRef.kill()
//       return process.exit(1)
//     }
//     if (childProcessRef) childProcessRef.kill()
//     childProcessRef = execa("node", [output], {
//       cwd,
//       env: process.env
//     })
//     childProcessRef.stderr.on("data", e => {
//       process.stderr.write(e)
//     })
//     childProcessRef.stdout.on("data", e => {
//       if (e.toString() === DEV_RESTART) {
//         logger.log("reload album.config.ts", "album")
//         watcher.close()
//         return startWatch()
//       }
//       process.stdout.write(e)
//     })
//   })
// }
