import type { AlbumSSRContextProps, ServerDynamicData } from "../../ssr/ssr.type.js"
import type { SSRComposeContextProps } from "./SSRComposeContextProps.type.js"

export type SSRComposeRenderRemoteComponentOptions = {
  renderProps: {
    sourcePath: string
    props: Record<string, any>
  }
  ssrContextProps: AlbumSSRContextProps
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
