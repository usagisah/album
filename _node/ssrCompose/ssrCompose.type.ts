export type SSRComposeDevConfig = {
  projectInputs: SSRComposeDevProjectInputs
}
export type SSRComposeStartProjectsInput = Map<
  string,
  {
    clientInput: string
    serverInput: string
    mainServerInput: string
  }
>

export type SSRComposeDevProjectInputs = Map<
  string,
  | {
      type: "dev"
    }
  | {
      type: "start"
      clientInput: string
      serverInput: string
      mainServerInput: string
    }
>
/* --------------  -------------- */

export type SSRCompose = {}

export type SSRComposeCoordinateValue = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
  devFilepath?: string
}

export type SSRComposeDependencies = Record<
  string,
  {
    filename: string
    filepath: string
    isCjs?: boolean
  }
>

export type SSRComposeCoordinateInput = Map<string, SSRComposeCoordinateValue>
