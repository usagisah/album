export type SSRRemoteType = "root" | "children"
export type SSRRemoteProps = Record<string, any>
export type SSRRemoteMessages = Record<string, any>
export type SSRRemoteSources = Record<
  string,
  {
    sourcePath: string
    sourceValue: string
    preloads: string[]
    meta: Record<string, any>
  }
>
