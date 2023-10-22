import type { SSRRemoteMessages, SSRRemoteProps, SSRRemoteStruct } from "./ssr-remote.type.js"

export function createSSRRemoteStruct(messages: SSRRemoteMessages, props: SSRRemoteProps): SSRRemoteStruct {
  return {
    type: "children",
    props,
    messages,
    sources: {}
  }
}
