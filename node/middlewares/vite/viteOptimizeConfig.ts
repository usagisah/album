import { mergeConfig, splitVendorChunkPlugin, UserConfig } from "vite"
import viteCompressionPlugin from "vite-plugin-compression"
import { AlbumContext } from "../../context/context.dev.type.js"
import { tsconfigPath } from "../../plugins/vite/tsconfigPaths.js"
import { AlbumServerViteConfig } from "../middlewares.type.js"

const configName = "album:optimize"
export function viteOptimizeOptions(context: AlbumContext, forceClient: boolean): AlbumServerViteConfig {
  return {
    name: configName,
    config: mergeConfig(commonConfig(context), context.env.mode === "production" ? prodConfig(context, forceClient) : devConfig())
  }
}

function commonConfig(context: AlbumContext): UserConfig {
  const { cwd } = context.inputs
  return {
    plugins: [splitVendorChunkPlugin(), tsconfigPath({ cwd })],
    build: { reportCompressedSize: false }
  }
}

export const defaultCompressionConfig: any = {
  deleteOriginFile: false,
  threshold: 10240,
  verbose: false
}

function devConfig(): UserConfig {
  return {}
}

function prodConfig(context: AlbumContext, forceClient: boolean): UserConfig {
  const { ssr } = context
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
    config.plugins!.push((viteCompressionPlugin as any)(defaultCompressionConfig))
  }
  return config
}
