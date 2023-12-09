import { RspackOptions, rspack } from "@rspack/core"
import { DevServerConfigTsconfig } from "../../context/context.type.js"
import { resolveTsconfigPaths } from "../../utils/path/resolveTsconfigPaths.js"

export type RsBuildConfig = {
  filename: string
  env: Record<string, string>
  input: string
  output: string
  tsconfig: DevServerConfigTsconfig
  cwd: string
}

export async function createRsConfig(config: RsBuildConfig): Promise<RspackOptions> {
  const { filename, env, input, output, tsconfig, cwd } = config
  const isProd = env.mode === "production"
  const mode = isProd ? "production" : "development"
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
          use: [
            {
              loader: "node-loader",
              options: {
                name: "[name].[hash].[ext]"
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
        if (request.startsWith(".") || keys.some(k => request.startsWith(k)) || request === input) cb()
        else cb(null, request)
      }
    ],
    stats: {
      preset: "errors-warnings"
    }
  }
}
