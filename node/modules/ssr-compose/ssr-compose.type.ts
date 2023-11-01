export type * from "./types/SSRComposeOptions.type.js"
export type * from "./types/SSRComposeSources.type.js"

import { AlbumSSRRenderOptions, ServerDynamicData } from "../ssr/ssr.type.js"
import { SSRComposeSources } from "./ssr-compose.type.js"

export type SSRComposeRenderProps = {
  sourcePath: string
  props: Record<string, any>
}

export type SSRComposeContextProps = {
  sources: SSRComposeSources
  renderRemoteComponent: (renderProps: SSRComposeRenderProps) => Promise<SSRComposeRenderRemoteComponentReturn>
}

export type SSRComposeRenderRemoteComponentOptions = {
  renderProps: SSRComposeRenderProps
  ssrComposeContextProps: SSRComposeContextProps
  ssrRenderOptions: AlbumSSRRenderOptions
}

export type SSRComposeRenderRemoteComponentReturn = {
  importPath: string
  serverDynamicData: ServerDynamicData
  assets: {
    css: string[]
  }
  html: string
}
