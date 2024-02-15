import { readdir, rm } from "fs/promises"
import { resolve } from "path"

export default async function setup() {
  const pid = await readdir(resolve(__dirname, "./helpers/.pid"))
  await Promise.all(
    pid.map(async id => {
      await rm(resolve(__dirname, "./helpers/.pid", id), { force: true })
    })
  )
}

export async function teardown() {
  const pid = await readdir(resolve(__dirname, "./helpers/.pid"))
  pid.map(id => {
    process.kill(Number(id))
  })
}
