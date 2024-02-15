import { readdir, rm } from "fs/promises"
import { resolve } from "path"

export async function setup() {
  await clearProject()
}

export async function teardown() {
  await clearProject()
}

async function clearProject() {
  const pid = await readdir(resolve(__dirname, "./helpers/.pid"))
  return Promise.all(
    pid.map(async id => {
      try {
        process.kill(Number(id))
      } catch {}
      return await rm(resolve(__dirname, "./helpers/.pid", id), { force: true })
    })
  )
}
