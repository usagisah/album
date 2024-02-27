import { BuildOptions, Plugin, build } from "esbuild"
import { readJson } from "fs-extra/esm"
import { readFile } from "fs/promises"
import ts from "typescript"

export function esbuildWithDecorator(options: BuildOptions) {
  const { plugins = [], ...opts } = options
  return build({ ...opts, plugins: [...plugins, tsDecoratorPlugin()] })
}

const decoratorReg = /@\w+\([\s\S]*?\)/
function tsDecoratorPlugin(): Plugin {
  return {
    name: "album:decorator",
    async setup(api) {
      const compilerOptions = await readJson(api.initialOptions.tsconfig!)
      api.onLoad({ filter: /\.ts$/ }, async args => {
        let file = await readFile(args.path, "utf-8")
        if (decoratorReg.test(file)) {
          const { diagnostics, outputText } = ts.transpileModule(file, compilerOptions)
          if (diagnostics && diagnostics.length > 0) {
            throw diagnostics
          }
          file = outputText
        }
        return {
          loader: "ts",
          contents: file
        }
      })
    }
  }
}
