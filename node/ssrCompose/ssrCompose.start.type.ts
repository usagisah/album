import { Func, Obj } from "../utils/types/types.js"

export type SSRComposeCoordinate = Obj

export type SSRComposeProject = {
  clientInput: string
  clientManifest: Obj
  ssrInput: string
  ssrManifest: Obj

  mainServerInput: string
  coordinate: SSRComposeCoordinate
  [x: string]: any
}

export type SSRComposeDependency = {
  filename: string
  filepath: string
  cjs: boolean
}

export type SSRComposeRewrite = Func<[string, Record<string, string>], string>
export type SSRComposeRewriter = Func<[string], string>

export type SSRComposeManager = {
  dependenciesMap: Map<string, SSRComposeDependency>
  projectMap: Map<string, SSRComposeProject>
  rewriter: SSRComposeRewriter
}
