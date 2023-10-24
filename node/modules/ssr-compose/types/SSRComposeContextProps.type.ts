import type { SSRComposeOptions } from "./SSRComposeOptions.type.js"
import type { SSRComposeRenderProps, SSRComposeRenderRemoteComponentReturn } from "./SSRComposeRenderRemoteComponent.type.js"
import type { SSRComposeSources } from "./SSRComposeSources.type.js"

export type SSRComposeContextProps = {
  sources: SSRComposeSources
  ssrComposeOptions: SSRComposeOptions
  renderRemoteComponent: (renderProps: SSRComposeRenderProps) => Promise<SSRComposeRenderRemoteComponentReturn>
}
