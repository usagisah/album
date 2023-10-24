export type SSRComposeSourceAssets = {
  css: Set<string>
}

export type SSRComposeSourceCache = {
  [props: string]:
    | {
        html: string
      }
    | false
}

export type SSRComposeSources = {
  [sourcePath: string]:
    | {
        importPath: string
        assets: SSRComposeSourceAssets
        cache: SSRComposeSourceCache
      }
    | false
}
