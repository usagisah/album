export type SSRCompose = {}

export type SsrComposeProjectsInput = Map<
  string,
  {
    clientInput: string
    clientManifestInput: string
    serverInput: string
    mainServerInput: string
    ssrComposeInput: string
  }
>
