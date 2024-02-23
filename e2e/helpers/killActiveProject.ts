import { readdir, rm } from "fs/promises"
import { resolve } from "path"

export async function killActiveProject() {
  const pid = await readdir(resolve(__dirname, "./.pid"))
  return Promise.all(
    pid.map(async id => {
      try {
        process.kill(Number(id))
      } catch {}
      return await rm(resolve(__dirname, "./.pid", id), { force: true })
    })
  )
}
