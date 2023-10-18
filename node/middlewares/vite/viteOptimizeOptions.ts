import { ViteConfigs } from "../middlewares.type.js"
import { UserConfig, mergeConfig, splitVendorChunkPlugin } from "vite"
import { AlbumContext } from "../../context/AlbumContext.type.js"
import tsconfigPaths from "vite-tsconfig-paths"
import viteCompressionPlugin from "vite-plugin-compression"
import viteImageminPlugin from "vite-plugin-imagemin"

export function viteOptimizeOptions(
  context: AlbumContext,
  forceClient: boolean
): ViteConfigs {
  const { mode } = context
  return {
    name: "albumOptimizeOptions",
    options: mergeConfig(
      commonOptions(context, forceClient),
      mode === "production"
        ? prodOptions(context, forceClient)
        : devOptions(context, forceClient)
    )
  }
}

function commonOptions(
  context: AlbumContext,
  forceClient: boolean
): UserConfig {
  const { inputs } = context
  return {
    plugins: [splitVendorChunkPlugin(), tsconfigPaths({ root: inputs.cwd })],
    build: {
      reportCompressedSize: false
    }
  }
}

function devOptions(context: AlbumContext, forceClient: boolean): UserConfig {
  return {}
}

function prodOptions(context: AlbumContext, forceClient: boolean): UserConfig {
  const { status } = context
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

  if (!status.ssr || forceClient) {
    config.plugins.push(
      (viteImageminPlugin as any)({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 20
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: "removeViewBox"
            },
            {
              name: "removeEmptyAttrs",
              active: false
            }
          ]
        }
      }),
      (viteCompressionPlugin as any)({
        deleteOriginFile: false,
        threshold: 10240
      })
    )
  }
  return config
}
