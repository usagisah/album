import { Func } from "../utils/types/types.js"
import { SSRComposeProject as StartSSRComposeProject } from "./ssrCompose.start.type.js"

export type SSRComposeProject = { type: "local"; meta: Map<string, any> } | ({ type: "start" } & StartSSRComposeProject)
export type SSRComposeProjectEvents = {
  has: (prefix: string) => boolean
  get: (prefix: string) => Omit<SSRComposeProject, "meta"> | null
  setMetaData: (prefix: string, key: string, value: any) => boolean
  getMetaData: <R = any>(prefix: string, key: string) => R | null
}

export type SSRComposeCoordinate = {
  devFilepath: string
}
export type SSRComposeCoordinateEvents = {
  get: (path: string) => SSRComposeCoordinate | null
}

export type SSRComposeRewrite = Func<[string, Record<string, string>], string>
export type SSRComposeRewriter = Func<[string], string>

export type SSRComposeManager = {
  dependencies: string[]
  castExtensions: string[]
  project: SSRComposeProjectEvents
  coordinate: SSRComposeCoordinateEvents
  rewrites: SSRComposeRewrite[]
  rewriter: SSRComposeRewriter
}
