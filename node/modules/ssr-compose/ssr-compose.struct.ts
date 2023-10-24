import type { SSRComposeSources } from "./ssr-compose.type.js"

export function createSSRRemoteStruct(props: Record<string, any>) {
  return {
    props,
    sources: {} as SSRComposeSources
  }
}
