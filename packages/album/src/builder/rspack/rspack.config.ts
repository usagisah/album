import { resolveTsconfigPaths } from "@albumjs/tools/node"
import { RspackOptions, rspack } from "@rspack/core"
import { ServerManagerTsconfig } from "../../server/server.dev.type.js"

export type RsBuildConfig = {
  filename: string
  env: Record<string, string>
  input: string
  output: string
  tsconfig: ServerManagerTsconfig
  cwd: string
}

export async function createRsConfig(config: RsBuildConfig): Promise<RspackOptions> {
  const { filename, env, input, output, tsconfig, cwd } = config
  const mode: any = env.mode
  const isProd = mode === "production"
  const alias = await resolveTsconfigPaths(tsconfig, cwd)
  return {
    cache: true,
    context: cwd,
    target: "node",
    mode,
    devtool: isProd ? false : "source-map",
    entry: input,
    output: {
      path: output,
      filename,
      chunkFormat: "module",
      clean: true,
      library: {
        type: "commonjs2"
      }
    },
    plugins: [
      new rspack.DefinePlugin({
        "process.env.NODE_ENV": mode,
        ...env
      })
    ],
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "node-loader",
          options: {
            name: "[name].[hash].[ext]"
          }
        },
        {
          test: /\.ts$/,
          exclude: [/node_modules/],
          loader: "builtin:swc-loader",
          type: "javascript/auto",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                decorators: true
              },
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true
              }
            }
          }
        }
      ]
    },
    experiments: {
      rspackFuture: {
        disableApplyEntryLazily: true
      }
    },
    optimization: {
      minimize: isProd
    },
    resolve: {
      alias
    },
    externalsType: "import",
    externals: [
      ({ request }: any, cb: any) => {
        const keys = Object.keys(alias)
        if (request.startsWith(".") || keys.some(k => request.startsWith(k)) || request === input) cb()
        else cb(null, request)
      }
    ],
    stats: {
      preset: "errors-warnings"
    }
  }
}
