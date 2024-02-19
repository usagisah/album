import { red } from "colorette"
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
    const pkgPath = resolve(__dirname, "../", pkgRoot)
    const p = execa("npm", ["run", scriptName, "--prefix", pkgPath, ...params])
    const pid = p.pid
    p.stdout!.on("data", async chunk => {
      const message = chunk + ""
      if (message.includes("[error]")) {
        process.stderr.write(red(`e2e:test setup fail, pkgPath:(${pkgPath})\n`) + message + "\n")
        return fail(pkgPath)
      }
      if (message.includes("listen")) {
        success({ kill: () => kill(pid), port: Number(message.match(/localhost:(\d+)/)![1]) })
        if (pid) {
          await writeFile(resolve(__dirname, ".pid", pid.toString()), "")
        }
      }
    })
  })
}
