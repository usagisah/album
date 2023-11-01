import { SSRComposeOptions } from "./SSRComposeOptions.type.js"
import { SSRComposeRenderProps, SSRComposeRenderRemoteComponentReturn } from "./SSRComposeRenderRemoteComponent.type.js"
import { SSRComposeSources } from "./SSRComposeSources.type.js"

export type SSRComposeContextProps = {
  sources: SSRComposeSources
  ssrComposeOptions: SSRComposeOptions
  renderRemoteComponent: (renderProps: SSRComposeRenderProps) => Promise<SSRComposeRenderRemoteComponentReturn>
}
