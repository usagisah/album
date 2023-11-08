export type SSRComposeDevConfig = {
  projectInputs: SSRComposeDevProjectInputs
}

export type SSRComposeDevProjectInputs = Map<
  string,
  | {
      type: "dev"
    }
  | {
      type: "start"
      clientInput: string
      ssrInput: string
      mainServerInput: string
    }
>
/* --------------  -------------- */

export type SSRComposeCoordinateValue = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
  devFilepath?: string
}

export type SSRComposeStartProjectsInput = Map<
  string,
  {
    clientInput: string
    ssrInput: string
    mainServerInput: string
  }
>

export type SSRComposeDependencies = Map<
  string,
  {
    filename: string
    filepath: string
    isCjs?: boolean
  }
>

export type SSRComposeCoordinateInput = Map<string, SSRComposeCoordinateValue>

export type SSRComposeStartConfig = {
  projectInputs: SSRComposeStartProjectsInput
  coordinateInputs: SSRComposeCoordinateInput
  dependenciesInputs: SSRComposeDependencies
}
