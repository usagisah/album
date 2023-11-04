import { parse, traverse } from "@babel/core"

export function analysisCjsModule(code: string) {
  let cjsModule = false
  traverse(parse(code), {
    AssignmentExpression(path) {
      const l = path.node.left
      if (l.type === "MemberExpression" && l.object.type === "Identifier") {
        if ((l.object.name === "module" && l.property.type === "Identifier" && l.property.name === "exports") || l.object.name === "exports") {
          cjsModule = true
          path.stop()
        }
      }
    }
  })
  return cjsModule
}
