import { Func } from "../utils/types/types.js"

export type SSRComposeCoordinate = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
}
export type SSRComposeCoordinateEvents = {
  get: (path: string) => SSRComposeCoordinate | null
}

export type SSRComposeProject = {
  clientInput: string
  ssrInput: string
  mainServerInput: string
  meta: Map<string, any>
}
export type SSRComposeProjectEvents = {
  has: (prefix: string) => boolean
  get: (prefix: string) => Omit<SSRComposeProject, "meta"> | null
  setMetaData: (prefix: string, key: string, value: any) => boolean
  getMetaData: <R = any>(prefix: string, key: string) => R | null
}

export type SSRComposeDependency = {
  filename: string
  filepath: string
  cjs: boolean
}

export type SSRComposeRewrite = Func<[string, Record<string, string>], string>
export type SSRComposeRewriter = Func<[string], string>

export type SSRComposeManager = {
  getImporterMap: () => Record<string, string>
  getDependencies: () => Map<string, SSRComposeDependency>
  project: SSRComposeProjectEvents
  coordinate: SSRComposeCoordinateEvents
  rewriter: SSRComposeRewriter
}
