import { readFile, writeFile } from "fs/promises"
import { resolve, sep } from "path"
import { AlbumContext } from "../../context/context.dev.type.js"

export async function buildCoordinate(context: AlbumContext) {
  if (!context.ssrComposeManager || !context.appManager.module.modulePath) return

  const { inputs, outputs, appManager, ssrComposeManager, logger } = context
  const { module } = appManager

  const { castExtensions } = ssrComposeManager
  const { cwd } = inputs
  const { clientOutDir } = outputs
  const manifest = JSON.parse(await readFile(`${clientOutDir}${sep}.vite/manifest.json`, "utf-8"))
  const moduleRoot = resolve(module.modulePath, "../").slice(cwd.length + 1)

  const _coordinate: Record<string, string> = {}
  for (const key of Object.getOwnPropertyNames(manifest)) {
    if (key.startsWith(moduleRoot) && castExtensions.some(v => key.endsWith(v))) {
      _coordinate[key.slice(moduleRoot.length + 1)] = key
    }
  }
  await writeFile(`${clientOutDir}${sep}.vite${sep}coordinate.json`, JSON.stringify(_coordinate), "utf-8")
  logger.log("生成 ssr-compose 坐标文件成功", "album")
}
