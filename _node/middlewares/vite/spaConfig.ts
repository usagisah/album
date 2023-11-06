import { readFile, writeFile } from "fs/promises"
import { relative, resolve } from "path"
import { InlineConfig, PluginOption } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"

export function createSPACoreConfig(context: AlbumDevContext): [InlineConfig, PluginOption] {
  const { info, clientManager } = context
  const { ssr, inputs, outputs } = info
  const { realClientInput } = clientManager!
  const { cwd } = inputs
  const { clientOutDir } = outputs
  const config: InlineConfig = {
    appType: ssr ? "custom" : "spa",
    build: {
      manifest: ssr,
      outDir: clientOutDir,
      rollupOptions: {
        input: ssr ? realClientInput : undefined
      }
    }
  }

  let html = ""
  const plugin: PluginOption = {
    name: "",
    async buildStart() {
      html = await readFile(resolve(cwd, "index.html"), "utf-8")
      await writeFile(resolve(cwd, "index.html"), html.replace("</body>", `<script type="module" src="/${relative(cwd, realClientInput)}"></script></body>`), "utf-8")
    },
    async buildEnd() {
      await writeFile(resolve("index.html"), html, "utf-8")
    }
  }

  return [config, ssr ? { name: "" } : plugin]
}
