import { execa } from "execa"
import { writeFile } from "fs/promises"
import { resolve } from "path"

export function setupProject(pkgRoot: string, scriptName: string) {
  return new Promise<void>((success, fail) => {
    const p = execa("npm", ["run", scriptName, "--prefix", resolve(__dirname, "../", pkgRoot)])
    p.stdout!.on("data", async chunk => {
      if ((chunk + "").toString().includes("listen")) {
        success()
        if (p.pid) {
          await writeFile(resolve(__dirname, ".pid", p.pid.toString()), "")
        }
      }
    })
  })
}
