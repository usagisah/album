import { InlineConfig, PluginOption } from "vite"
import { AlbumDevContext } from "../../context/context.type.js"

const configName = "album:ssr"
export function createSSRCoreConfig(context: AlbumDevContext): [InlineConfig, PluginOption] {
  const { info, clientManager } = context
  const { outputs } = info
  const { realSSRInput } = clientManager!
  const { ssrOutDir } = outputs
  const config: InlineConfig = {
    appType: "custom",
    build: {
      ssrManifest: true,
      ssr: true,
      outDir: ssrOutDir!,
      rollupOptions: {
        input: realSSRInput!
      }
    }
  }
  return [config, { name: configName }]
}
