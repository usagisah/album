import { SSRComposeProject as DevProject, SSRComposeBuild } from "../../ssrCompose/ssrCompose.dev.type.js"
import { SSRComposeProject as StartProject } from "../../ssrCompose/ssrCompose.start.type.js"
import { AlbumSSRRenderOptions, AlbumSSRServerDynamicData, CtrlOptions } from "../ssr/ssr.type.js"

export type SSRComposeSourceCache = {
  [props: string]:
    | {
        html: string
      }
    | false
}

export type SSRComposeSources = {
  [sourcePath: string]:
    | {
        importPaths: Set<string>
        css: Set<string>
        cache: SSRComposeSourceCache
      }
    | false
}

export type SSRComposeRenderProps = {
  sourcePath: string
  props: Record<string, any>
}

export type SSRComposeRenderRemoteComponentOptions = AlbumSSRRenderOptions & {
  renderProps: SSRComposeRenderProps
}

export type SSRComposeRenderRemoteComponentReturn = {
  serverDynamicData: AlbumSSRServerDynamicData
  html: string
  css: string[]
  importPath: string
  sources: SSRComposeSources
}

export type AlbumSSRComposeContext = {
  ssrComposeRoot: string
  dependenciesMap: Record<string, string>
  projectMap: Map<string, DevProject | StartProject>
  sources: SSRComposeSources
  renderRemoteComponent: (renderProps: SSRComposeRenderProps, ctrl: CtrlOptions) => Promise<SSRComposeRenderRemoteComponentReturn>
  ssrComposeBuild: SSRComposeBuild
}
