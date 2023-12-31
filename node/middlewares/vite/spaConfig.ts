import { readFile, writeFile } from "fs/promises"
import { relative, resolve } from "path"
import { InlineConfig, PluginOption } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"

const configName = "album:spa"
export function createSPACoreConfig(context: AlbumContext): [InlineConfig, PluginOption] {
  const { serverMode, ssr, inputs, outputs, appManager } = context
  const { realClientInput } = appManager
  const { cwd } = inputs
  const { clientOutDir } = outputs
  const config: InlineConfig = {
    appType: "custom",
    build: {
      manifest: ssr,
      outDir: clientOutDir,
      rollupOptions: {
        input: ssr ? realClientInput : undefined
      }
    }
  }

  let plugin: PluginOption
  if (serverMode === "build") {
    let html = ""
    plugin = {
      name: configName,
      async buildStart() {
        html = await readFile(resolve(cwd, "index.html"), "utf-8")
        await writeFile(resolve(cwd, "index.html"), html.replace("</body>", `<script type="module" src="/${relative(cwd, realClientInput)}"></script></body>`), "utf-8")
      },
      async buildEnd() {
        await writeFile(resolve("index.html"), html, "utf-8")
      }
    }
  } else {
    plugin = {
      name: configName,
      transformIndexHtml(html) {
        return html.replace("</body>", `<script type="module" src="/${relative(cwd, realClientInput)}"></script></body>`)
      }
    }
  }

  return [config, ssr ? { name: configName } : plugin]
}
