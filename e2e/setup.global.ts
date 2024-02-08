import { readdir, rm } from "fs/promises"
import { resolve } from "path"

export async function teardown() {
  const pid = await readdir(resolve(__dirname, "./helpers/.pid"))
  await Promise.all(pid.map(async id => {
    process.kill(Number(id))
    await rm(resolve(__dirname, "./helpers/.pid", id), { force: true })
  }))
}
