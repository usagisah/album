import { Configuration, RspackOptions, rspack } from "@rspack/core"
import { resolveTsconfigPaths } from "../../utils/path/resolveTsconfigPaths.js"

export type RsConfig = {
  filename: string
  env: Record<string, string>
  input: string
  output: string
  tsconfigPath: string
}

export async function createRsConfig(config: RsConfig): Promise<RspackOptions> {
  const { filename, env, input, output, tsconfigPath } = config
  const isProd = env.mode === "production"
  const mode = isProd ? "production" : "development"
  const alias = await resolveTsconfigPaths(tsconfigPath)
  return {
    cache: true,
    target: "es2022",
    mode,
    devtool: isProd ? false : "source-map",
    entry: input,
    output: {
      path: output,
      filename,
      module: true,
      clean: false
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
          use: [
            {
              loader: "node-loader",
              options: {
                name: "[path][name].[ext]"
              }
            }
          ]
        },
        {
          test: /\.ts$/,
          use: {
            loader: "builtin:swc-loader",
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
        }
      ]
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
        request.startsWith(".") || keys.some(k => request.startsWith(k)) ? cb() : cb(null, request)
      }
    ],
    stats: {
      colors: false,
      preset: "errors-warnings",
      timings: false
    }
  }
}
