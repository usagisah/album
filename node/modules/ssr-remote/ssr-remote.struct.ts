import type {
  SSRRemoteType,
  SSRRemoteProps,
  SSRRemoteMessages,
  SSRRemoteSources
} from "./ssr-remote.type.js"

export class SSRRemoteStruct {
  type: SSRRemoteType = "children"
  sources: SSRRemoteSources
  constructor(
    name: string,
    public messages: SSRRemoteMessages,
    public props: SSRRemoteProps
  ) {
    this.sources[name] = {
      preloads: [],
      sourcePath: "",
      sourceValue: "",
      meta: {}
    }
  }
}
