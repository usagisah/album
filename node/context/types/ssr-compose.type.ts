export type SSRCompose = {}

export type SsrComposeProjectsInput = Map<
  string,
  {
    clientInput: string
    serverInput: string
    mainServerInput: string
  }
>

export type SSRComposeCoordinateValue = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
  devFilepath?: string
}

export type SSRComposeCoordinateInput = Map<string, SSRComposeCoordinateValue>
