import type { PluginViteConfig, ViteUserConfig } from "../middlewares.type.js"

import { mergeConfig, splitVendorChunkPlugin } from "vite"
import viteCompressionPlugin from "vite-plugin-compression"
import tsconfigPaths from "vite-tsconfig-paths"
import { AlbumContext } from "../../context/AlbumContext.type.js"

export function viteOptimizeOptions(context: AlbumContext, forceClient: boolean): PluginViteConfig {
  const { mode } = context
  return {
    name: "albumOptimizeConfig",
    options: mergeConfig(commonOptions(context, forceClient), mode === "production" ? prodOptions(context, forceClient) : devOptions(context, forceClient))
  }
}

function commonOptions(context: AlbumContext, forceClient: boolean): ViteUserConfig {
  const { inputs } = context
  return {
    plugins: [splitVendorChunkPlugin(), tsconfigPaths({ root: inputs.cwd })],
    build: {
      reportCompressedSize: false
    }
  }
}

function devOptions(context: AlbumContext, forceClient: boolean): ViteUserConfig {
  return {}
}

function prodOptions(context: AlbumContext, forceClient: boolean): ViteUserConfig {
  const { status } = context
  const config: ViteUserConfig = {
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

  if (!status.ssr || forceClient) {
    config.plugins.push(
      (viteCompressionPlugin as any)({
        deleteOriginFile: false,
        threshold: 10240
      })
    )
  }
  return config
}
