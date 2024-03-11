import { InlineConfig, PluginOption } from "vite"
import { AlbumContext } from "../../context/context.dev.type.js"

const configName = "album:ssr"
export function createSSRCoreConfig(context: AlbumContext): [InlineConfig, PluginOption] {
  const { outputs, appManager } = context
  const { ssrOutDir } = outputs
  const config: InlineConfig = {
    appType: "custom",
    build: {
      manifest: true,
      ssrManifest: true,
      ssr: true,
      outDir: ssrOutDir!,
      rollupOptions: {
        input: appManager.realSSRInput
      }
    }
  }
  return [config, { name: configName }]
}
