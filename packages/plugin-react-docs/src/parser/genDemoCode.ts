import { AlbumContext } from "@albumjs/album/server"
import { outputFileSync } from "@albumjs/tools/lib/fs-extra"
import { resolve } from "path"

let count = 0
export function genDemoCode({ serverMode, inputs }: AlbumContext, code: string) {
  const { cwd, dumpInput } = inputs
  const name = `Comp${count++}.tsx`
  const outPath = resolve(dumpInput, `plugin-react-docs/demos/${name}`)
  outputFileSync(outPath, code, { encoding: "utf-8" })
  return serverMode === "build" ? `/assets/demos/${name}` : outPath.slice(cwd.length)
}
