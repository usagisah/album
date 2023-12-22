import { Func, Obj } from "../utils/types/types.js"

export type SSRComposeCoordinate = Obj

export type SSRComposeProject = {
  clientInput: string
  clientManifest: Obj
  mainClientInput: string
  ssrInput: string
  ssrManifest: Obj
  ssrSSRManifest: Obj
  mainServerInput: string

  coordinate: SSRComposeCoordinate
  [x: string]: any
}

export type SSRComposeDependency = {
  filename: string
  filepath: string
  cjs: boolean
}

export type SSRComposeRewrite = { encode: Func<[string], string>[]; decode: Func<[string], string>[] }

export type SSRComposeManager = {
  dependenciesMap: Map<string, SSRComposeDependency>
  projectMap: Map<string, SSRComposeProject>
}
