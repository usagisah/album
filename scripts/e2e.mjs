import { execaCommand } from "execa"
import { resolve } from "path"

const cwd = process.cwd()
const target = process.argv.slice(2)
const buildStart = async () => {
  const clientPromise = execaCommand(`cd ${resolve(cwd, "e2e/react/client")} && pnpm build`, { shell: true })
  const serverPromise = execaCommand(`cd ${resolve(cwd, "e2e/react/server")} && pnpm build`, { shell: true })
  const ssrPromise = execaCommand(`cd ${resolve(cwd, "e2e/react/ssr")} && pnpm build`, { shell: true })
  const err = await Promise.allSettled([clientPromise, serverPromise, ssrPromise]).then(r => r.filter(r => r.status === "rejected"))
  if (err.length > 0) {
    throw err.map(e => e.reason)
  }
}
if (target.length === 0 || (target.length === 1 && target[0] === "react/__test__/start")) {
  await buildStart()
}
execaCommand(`vitest run -c e2e/vitest.config.ts ${target.join(" ")}`, { stdout: process.stdout, shell: true })
