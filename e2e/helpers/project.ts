import { red } from "@albumjs/tools/lib/colorette"
import { execa } from "@albumjs/tools/lib/execa"
import { writeFile } from "fs/promises"
import { resolve } from "path"
import { killActiveProject } from "./killActiveProject"

export function setupProject(pkgRoot: string, scriptName: string, params: string[] = []) {
  return new Promise<number>(async (success, fail) => {
    await killActiveProject()

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
        success(Number(message.match(/localhost:(\d+)/)![1]))
        if (pid) {
          await writeFile(resolve(__dirname, ".pid", pid.toString()), "")
        }
      }
    })
  })
}
