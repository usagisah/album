import { Func, InferObj, Obj } from "../utils/types/types.js"
import { SSRComposeProject as StartProject } from "./ssrCompose.start.type.js"

export type SSRComposeCoordinate = Obj<{ filepath: string; changed: boolean }>
export type SSRComposeRewrite = Func<[string, Record<string, string>], string>

export type SSRComposeProject = {
  local: boolean
  coordinate: SSRComposeCoordinate
  [x: string]: any
}
export type SSRComposeRewriter = Func<[string], string>

export type SSRComposeBuild = Func<[{ coordinate: InferObj<SSRComposeCoordinate>; input: string; outDir: string }], Promise<void>>

export type SSRComposeManager = {
  dependencies: string[]
  castExtensions: string[]
  projectMap: Map<string, SSRComposeProject | StartProject>
  rewrites: SSRComposeRewrite[]
  rewriter: SSRComposeRewriter
  build: SSRComposeBuild
}
