import { BuildOptions, Plugin, build } from "esbuild"
import { readJson } from "fs-extra/esm"
import { readFile } from "fs/promises"
import ts from "typescript"
import { isString } from "../check/index.js"
import { Obj } from "../types/types.js"

export function esbuildWithDecorator(options: BuildOptions) {
  const { plugins = [], ...opts } = options
  return build({ ...opts, plugins: [...plugins, tsDecoratorPlugin()] })
}

const decoratorReg = /@\w+\([\s\S]*?\)/
function tsDecoratorPlugin(): Plugin {
  return {
    name: "album:decorator",
    async setup(api) {
      let tsconfigConfigJson: Obj = {}
      const { tsconfig, tsconfigRaw } = api.initialOptions
      if (tsconfig) {
        tsconfigConfigJson = await readJson(tsconfig)
      }
      if (tsconfigRaw) {
        tsconfigConfigJson = isString(tsconfigRaw) ? JSON.parse(tsconfigRaw) : tsconfigRaw
      }
      api.onLoad({ filter: /\.ts$/ }, async args => {
        let file = await readFile(args.path, "utf-8")
        if (decoratorReg.test(file)) {
          const { diagnostics, outputText } = ts.transpileModule(file, {
            compilerOptions: { ...(tsconfigConfigJson.compilerOptions ?? {}), module: ts.ModuleKind.ESNext }
          })
          if (diagnostics && diagnostics.length > 0) {
            throw diagnostics
          }
          file = outputText
        }
        return { contents: file, loader: "ts" }
      })
    }
  }
}
