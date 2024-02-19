import { green } from "colorette"
import { execa } from "execa"
import { readdir, rm } from "fs/promises"
import { resolve } from "path"

export async function setup() {
  const target = process.argv.slice(5)
  if (target.length === 1) {
    if (target[0] === "react/__test__/start") {
      process.stdout.write(green(`building... ${target[0]}\n`))
      const clientPromise = execa("npm", ["run", "build", "--prefix", resolve(__dirname, "react/client")])
      const serverPromise = execa("npm", ["run", "build", "--prefix", resolve(__dirname, "react/server")])
      const ssrPromise = execa("npm", ["run", "build", "--prefix", resolve(__dirname, "react/ssr")])
      const composePromise = execa("npm", ["run", "build:all", "--prefix", resolve(__dirname, "react/ssr-compose")])
      const err = await Promise.allSettled([clientPromise, serverPromise, ssrPromise, composePromise]).then(r => r.filter(r => r.status === "rejected") as PromiseRejectedResult[])
      if (err.length > 0) {
        throw err.map(e => e.reason)
      }
      process.stdout.write(green(`build ${target[0]} success\n`))
    }
  }
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
