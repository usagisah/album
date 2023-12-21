import { SSRComposeBuild } from "../../ssrCompose/ssrCompose.dev.type.js"
import { SSRComposeProject as DevProject, SSRComposeProject as StartProject } from "../../ssrCompose/ssrCompose.start.type.js"
import { AlbumSSRRenderOptions, AlbumSSRServerDynamicData, CtrlOptions } from "../ssr/ssr.type.js"

export type SSRComposeSourceAssets = {
  css: Set<string>
}

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
        importPath: string
        assets: SSRComposeSourceAssets
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
  importPath: string
  serverDynamicData: AlbumSSRServerDynamicData
  assets: {
    css: string[]
  }
  html: string
}

export type AlbumSSRComposeContext = {
  dependenciesMap: Record<string, string>
  projectMap: Map<string, DevProject | StartProject>
  sources: SSRComposeSources
  renderRemoteComponent: (renderProps: SSRComposeRenderProps, ctrl: CtrlOptions) => Promise<SSRComposeRenderRemoteComponentReturn>
  ssrComposeBuild: SSRComposeBuild
}
