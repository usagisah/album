import { Configuration } from "webpack"
const { basename, dirname } = require("path")
const webpack = require("webpack")
const nodeExternals = require("webpack-node-externals")
const ProgressPlugin = require("progress-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

type Params = {
  mode: Configuration["mode"]
  entry: string
  output: string
  lib: boolean
}

export function createWebpackConfig({
  mode,
  entry,
  lib,
  output
}: Params): Configuration {
  const { devtool, optimization, plugins } =
    mode === "production" ? productionOptions() : developmentOptions()
  return {
    devtool,
    ignoreWarnings: [/^(?!CriticalDependenciesWarning$)/],
    externals: [nodeExternals(), { esbuild: `require("esbuild")` }],
    externalsPresets: {
      node: true
    },
    mode,
    target: "async-node",
    entry,
    output: {
      path: dirname(output),
      filename: basename(output),
      library: lib ? { type: "commonjs" } : undefined
    },
    cache: {
      type: "filesystem"
    },
    module: {
      rules: [
        {
          test: /\.(ts)|(tsx)|(js)|(jsx)(cjs)(mjs)$/,
          use: [
            // {
            //   loader: "thread-loader",
            //   options: {
            //     workers: require("os").cpus()
            //   }
            // },
            {
              loader: "swc-loader",
              options: {
                jsc: {
                  target: "es2018",
                  parser: {
                    syntax: "typescript",
                    tsx: true,
                    decorators: true,
                    dynamicImport: true
                  },
                  transform: {
                    decoratorMetadata: true
                  }
                }
              }
            }
          ]
        }
      ]
    },
    optimization,
    resolve: {
      extensions: [".ts", ".js", ".tsx", ".jsx", ".vue"],
      plugins
    },
    plugins: [
      new webpack.DefinePlugin({
        "import.meta.env.SSR": true
      })
    ],
    performance: {
      hints: "error"
    }
  }
}

const developmentOptions = () =>
  ({
    devtool: "eval-source-map",
    optimization: {
      moduleIds: "deterministic"
    },
    plugins: []
  } as any)

const productionOptions = () =>
  ({
    devtool: false,
    optimization: {
      providedExports: true,
      sideEffects: true,
      usedExports: true,
      removeAvailableModules: true,
      mergeDuplicateChunks: true,
      mangleWasmImports: true,
      minimize: true,
      concatenateModules: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {}
        })
      ]
    },
    plugins: [new ProgressPlugin(true)]
  } as any)
