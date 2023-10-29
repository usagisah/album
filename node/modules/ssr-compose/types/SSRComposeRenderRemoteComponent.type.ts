import type { AlbumSSRContextOptions, ServerDynamicData } from "../../ssr/ssr.type.js"
import type { SSRComposeContextProps } from "./SSRComposeContextProps.type.js"

export type SSRComposeRenderProps = {
  sourcePath: string
  props: Record<string, any>
}

export type SSRComposeRenderRemoteComponentOptions = {
  renderProps: SSRComposeRenderProps
  ssrContextProps: AlbumSSRContextOptions
  ssrComposeContextProps: SSRComposeContextProps
}

export type SSRComposeRenderRemoteComponentReturn = {
  importPath: string
  serverDynamicData: ServerDynamicData
  assets: {
    css: string[]
  }
  html: string
}
