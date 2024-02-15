import { execa } from "execa"
import { rm, writeFile } from "fs/promises"
import { resolve } from "path"

export function setupProject(pkgRoot: string, scriptName: string, params: string[] = []) {
  async function kill(id?: number) {
    if (!id) return
    process.kill(id)
    await rm(resolve(__dirname, ".pid", id + ""), { force: true })
  }

  return new Promise<{ kill: () => Promise<void>; port: number }>((success, fail) => {
    const p = execa("npm", ["run", scriptName, "--prefix", resolve(__dirname, "../", pkgRoot), ...params])
    const pid = p.pid
    p.stdout!.on("data", async chunk => {
      const message = chunk + ""
      if (message.includes("listen")) {
        success({ kill: () => kill(pid), port: Number(message.match(/localhost:(\d+)/)![1]) })
        if (pid) {
          await writeFile(resolve(__dirname, ".pid", pid.toString()), "")
        }
      }
    })
  })
}
