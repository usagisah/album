import { mergeConfig, splitVendorChunkPlugin, UserConfig } from "vite"
import viteCompressionPlugin from "vite-plugin-compression"
import { AlbumDevContext } from "../../context/context.type.js"
import { tsconfigPath } from "../../plugins/vite/tsconfigPaths.js"
import { AlbumServerViteConfig } from "../middlewares.type.js"

const configName = "album:optimize"
export function viteOptimizeOptions(context: AlbumDevContext, forceClient: boolean): AlbumServerViteConfig {
  const { mode } = context.info
  return {
    name: configName,
    config: mergeConfig(commonConfig(context), mode === "production" ? prodConfig(context, forceClient) : devConfig())
  }
}

function commonConfig(context: AlbumDevContext): UserConfig {
  const { cwd } = context.info.inputs
  return {
    plugins: [splitVendorChunkPlugin(), tsconfigPath({ cwd })],
    build: { reportCompressedSize: false }
  }
}

function devConfig(): UserConfig {
  return {}
}

function prodConfig(context: AlbumDevContext, forceClient: boolean): UserConfig {
  const { ssr } = context.info
  const config: UserConfig = {
    plugins: [],
    build: {
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_debugger: true,
          ecma: 2020
        },
        format: {
          comments: false
        }
      },
      cssMinify: "lightningcss"
    }
  }

  if (!ssr || forceClient) {
    config.plugins!.push(
      (viteCompressionPlugin as any)({
        deleteOriginFile: false,
        threshold: 10240,
        verbose: false
      })
    )
  }
  return config
}
