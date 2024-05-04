import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy } from "@albumjs/tools/lib/fs-extra"
import { resolve } from "path"
import { InlineConfig, build, mergeConfig } from "vite"
import { PluginContext } from "../docs.type.js"

export async function renderDemos(p: PluginBuildStartParam, context: PluginContext) {
  const { demos } = context
  const { resolveMiddlewareConfig, info } = p
  const { inputs, outputs } = info
  const { viteConfigs } = await resolveMiddlewareConfig(true)
  const { outDir } = outputs

  const demosEntry: Record<string, string> = {}
  demos.forEach(({ name, filepath }) => (demosEntry[name] = filepath))

  const tempOutDir = resolve(inputs.cwd, ".temp/Comp")
  const demoBuildConfig = mergeConfig(viteConfigs, {
    build: {
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: tempOutDir,
      ssr: false,
      ssrEmitAssets: false,
      copyPublicDir: false,
      manifest: false,
      ssrManifest: false,
      minify: true,
      cssMinify: true,
      sourcemap: false,
      lib: {
        entry: demosEntry,
        formats: ["es"]
      }
    }
  } as InlineConfig)
  await build(demoBuildConfig)
  await copy(tempOutDir, resolve(outDir, "assets/demos"))
}
