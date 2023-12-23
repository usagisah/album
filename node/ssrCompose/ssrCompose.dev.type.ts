import { Func, InferObj, Obj } from "../utils/types/types.js"
import { SSRComposeProject as StartProject } from "./ssrCompose.start.type.js"

export type SSRComposeCoordinate = Obj<{ filepath: string; changed: boolean }>
export type SSRComposeRewrite = { encode: Func<[string], string>[]; decode: Func<[string], string>[] }

export type SSRComposeProject = {
  local: boolean
  coordinate: SSRComposeCoordinate
}

export type SSRComposeBuild = Func<[{ coordinate: InferObj<SSRComposeCoordinate>; input: string; outDir: string }], Promise<void>>

export type SSRComposeManager = {
  dependencies: string[]
  castExtensions: string[]
  rewrites: SSRComposeRewrite
  startRoot: string
  projectMap: Map<string, SSRComposeProject | StartProject>
  build: SSRComposeBuild
}
