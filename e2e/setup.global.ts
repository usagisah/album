import { green } from "@albumjs/tools/lib/colorette"
import { execaCommand } from "@albumjs/tools/lib/execa"
import { resolve } from "path"
import { killActiveProject } from "./helpers/killActiveProject"

export async function setup() {
  const target = process.argv.slice(5)
  const buildStart = async () => {
    process.stdout.write(green(`building... ${target[0] ?? "all"}\n`))
    const clientPromise = execaCommand(`cd ${resolve(__dirname, "react/client")} && pnpm build`, { shell: true })
    const serverPromise = execaCommand(`cd ${resolve(__dirname, "react/server")} && pnpm build`, { shell: true })
    const ssrPromise = execaCommand(`cd ${resolve(__dirname, "react/ssr")} && pnpm build`, { shell: true })
    const composePromise = execaCommand(`cd ${resolve(__dirname, "react/ssr-compose")} && pnpm build:all`, { shell: true })
    const err = await Promise.allSettled([clientPromise, serverPromise, ssrPromise, composePromise]).then(r => r.filter(r => r.status === "rejected") as PromiseRejectedResult[])
    if (err.length > 0) {
      throw err.map(e => e.reason)
    }
    process.stdout.write(green(`build ${target[0] ?? "all"} success\n`))
  }
  if (target.length === 0 || (target.length === 1 && target[0] === "react/__test__/start")) {
    await buildStart()
  }
  await killActiveProject()
}

export async function teardown() {
  await killActiveProject()
}
