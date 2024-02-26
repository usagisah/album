import { existsSync } from "fs"
import { mkdir, readdir, rm } from "fs/promises"
import { resolve } from "path"

const pidDir = resolve(__dirname, "./.pid")
export async function killActiveProject() {
  if (!existsSync(pidDir)) {
    await mkdir(pidDir, { recursive: true })
  }
  const pid = await readdir(pidDir)
  return Promise.all(
    pid.map(async id => {
      try {
        process.kill(Number(id))
      } catch {}
      return await rm(resolve(__dirname, "./.pid", id), { force: true })
    })
  )
}
