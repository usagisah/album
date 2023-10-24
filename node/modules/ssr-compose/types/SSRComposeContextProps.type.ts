import type { SSRComposeOptions } from "./SSRComposeOptions.type.js"
import type { SSRComposeRenderRemoteComponentReturn } from "./SSRComposeRenderRemoteComponent.type.js"
import type { SSRComposeSources } from "./SSRComposeSources.type.js"

export type SSRComposeContextProps = {
  sources: SSRComposeSources
  ssrComposeOptions: SSRComposeOptions
  renderRemoteComponent: (renderProps: { sourcePath: string; props: Record<string, any> }) => Promise<SSRComposeRenderRemoteComponentReturn>
}
