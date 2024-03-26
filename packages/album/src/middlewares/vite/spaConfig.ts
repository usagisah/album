import { isBlank } from "@albumjs/tools/node"
import { readFile } from "fs/promises"
import { relative, resolve } from "path"
import { InlineConfig, PluginOption } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"

const configName = "album:spa"
export function createSPACoreConfig(context: AlbumContext): [InlineConfig, PluginOption] {
  const { ssr, inputs, outputs, appManager } = context
  const { cwd } = inputs
  const { clientOutDir } = outputs
  const config: InlineConfig = {
    appType: "custom",
    build: {
      manifest: ssr,
      outDir: clientOutDir,
      rollupOptions: {
        input: ssr ? appManager.realClientInput : undefined
      }
    }
  }
  if (ssr && isBlank(appManager.realClientInput)) {
    throw "build-ssr 发现入口为空"
  }

  const indexHtmlPath = resolve(cwd, "index.html")
  const plugin: PluginOption = {
    name: configName,
    async load(id) {
      if (id === indexHtmlPath) {
        const html = await readFile(resolve(cwd, "index.html"), "utf-8")
        return html.replace("</body>", `<script type="module" src="/${relative(cwd, appManager.realClientInput)}"></script>\n </body>`)
      }
    }
  }
  return [config, ssr ? { name: configName } : plugin]
}
