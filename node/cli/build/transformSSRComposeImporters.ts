import { parse, traverse } from "@babel/core"
import MS from "magic-string"
import { mergeConfig } from "vite"
import { SSRComposeDependencies } from "../../context/AlbumContext.type.js"
import { ViteConfig } from "../../middlewares/middlewares.type.js"

const reservedWords$1 = "break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public"
const builtins$1 = "arguments Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl"
const forbiddenIdentifiers = new Set(`${reservedWords$1} ${builtins$1}`.split(" "))
forbiddenIdentifiers.add("")

const makeLegalIdentifier = function makeLegalIdentifier(str: string) {
  let identifier = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^$_a-zA-Z0-9]/g, "_")
  if (/\d/.test(identifier[0]) || forbiddenIdentifiers.has(identifier)) {
    identifier = `_${identifier}`
  }
  return identifier || "_"
}

function createMakeLegalName() {
  const counter = { true: 0, false: 0 }
  return function (name: string, isExport: boolean) {
    const { prefix, index } = isExport ? { prefix: "Export", index: counter.true++ } : { prefix: "Import", index: counter.false++ }
    return `_album_cjs${prefix}${index}_${makeLegalIdentifier(name)}`
  }
}

function transformSSRComposeImporters(code: string, cjsModules: string[]) {
  const str = new MS(code)
  const makeLegalName = createMakeLegalName()
  traverse(parse(code, { plugins: ["@babel/plugin-syntax-jsx", ["@babel/plugin-syntax-typescript", { isTSX: true }]] }), {
    ExportAllDeclaration({ node }) {
      const importedName = node.source.value
      if (!cjsModules.includes(importedName)) return
      throw `不支持 export * from "${importedName}" 这种导出方式，请改用命名导出`
    },
    ExportNamedDeclaration({ node }) {
      if (!node.source) return

      const importedName = node.source.value
      if (!cjsModules.includes(importedName) || node.specifiers.length === 0) return

      const cjsModuleName = makeLegalName(importedName, false)
      const importNames = []
      const exportNames = []

      let defaultExports = ""
      for (const spec of node.specifiers) {
        if (spec.exported.type !== "Identifier") continue
        const exportedName = spec.exported.name

        // export * as x from ""
        if (spec.type === "ExportNamespaceSpecifier") {
          throw `不支持 export * as ${exportedName} from "${importedName}" 这种导出方式，请改用命名导出`
        }

        // export {x as default} from ""
        if (exportedName === "default") {
          defaultExports = makeLegalName("default", true)
          importNames.push({
            importedName,
            localName: defaultExports
          })
        }

        // export {x} from ""
        else {
          const localName = makeLegalName(exportedName, true)
          importNames.push({ importedName, localName })
          exportNames.push(`${localName} as ${exportedName}`)
        }
      }

      const lines = [`import ${cjsModuleName} from "${importedName}"`]

      importNames.forEach(({ importedName, localName }) => {
        if (importedName === "*") {
          lines.push(`const ${localName} = ${cjsModuleName}`)
        } else if (importedName === "default") {
          lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`)
        } else {
          lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`)
        }
      })
      if (defaultExports) {
        lines.push(`export default ${defaultExports}`)
      }
      if (exportNames.length) {
        lines.push(`export { ${exportNames.join(", ")} }`)
      }

      const { start, end } = node
      str.overwrite(start, end, lines.join("; ") + ";\n")
    },
    ImportDeclaration({ node }) {
      const importedName = node.source.value
      if (!cjsModules.includes(importedName)) return

      const { start, end } = node
      if (!node.specifiers.length) {
        str.overwrite(start, end, `import "/${importedName}"`)
        return
      }

      const importNames = []
      for (const spec of node.specifiers) {
        // import {} from ""
        if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
          const importedName = spec.imported.name
          const localName = spec.local.name
          importNames.push({ importedName, localName })
        }
        // import d from "" / import d,{} from ""
        else if (spec.type === "ImportDefaultSpecifier") {
          importNames.push({
            importedName: "default",
            localName: spec.local.name
          })
        }
        // import * as d from ""
        else if (spec.type === "ImportNamespaceSpecifier") {
          importNames.push({
            importedName: "*",
            localName: spec.local.name
          })
        } else {
          throw "存在未处理的 case，请联系作者解决 bug"
        }
      }

      const cjsModuleName = makeLegalName(importedName, false)
      const lines = [`import ${cjsModuleName} from "${importedName}"`]
      importNames.forEach(({ importedName, localName }) => {
        if (importedName === "*") {
          lines.push(`const ${localName} = ${cjsModuleName}`)
        } else if (importedName === "default") {
          lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`)
        } else {
          lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`)
        }
      })
      str.overwrite(start, end, lines.join("; ") + ";\n")
    },
    CallExpression({ node }) {
      if (node.callee.type !== "Import" || node.arguments[0].type !== "StringLiteral") return

      const importedName = node.arguments[0].value
      if (!cjsModules.includes(importedName)) return

      str.appendLeft(node.end, ".then(m => m.default && m.default.__esModule ? m.default : ({ ...m.default, default: m.default }))")
    }
  })
  return str.toString()
}

const applyFilesReg = /\.(js|ts|jsx|tsx)$/
export function withTransformCjsPlugin(config: ViteConfig, ssrComposeDependencies: SSRComposeDependencies) {
  const external = Object.getOwnPropertyNames(ssrComposeDependencies)
  return mergeConfig(config, {
    name: "album:ssr-compose-cjs",
    build: {
      rollupOptions: {
        external
      }
    },
    plugins: [
      {
        name: "album:ssr-compose-cjs",
        enforce: "post",
        transform(code, id) {
          if (applyFilesReg.test(id)) {
            return transformSSRComposeImporters(code, external.filter(v => ssrComposeDependencies[v].isCjs))
          }
        }
      }
    ]
  } as ViteConfig)
}
