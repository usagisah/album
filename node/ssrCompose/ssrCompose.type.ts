export type SSRComposeDevConfig = {
  projectInputs: SSRComposeDevProjectInputs
  dependencies: string[]
}

export type SSRComposeDevProjectInputs = Map<string, {}>
/* --------------  -------------- */

export type SSRComposeCoordinateValue = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
}

export type SSRComposeDevCoordinateValue = {
  devFilepath: string
}

export type SSRComposeStartProjectsInput = Map<
  string,
  {
    clientInput: string
    ssrInput: string
    mainServerInput: string
    [x: string]: any
  }
>

export type SSRComposeDependencies = Map<
  string,
  {
    filename: string
    filepath?: string
    cjs: boolean
  }
>

export type SSRComposeCoordinateInput = Map<string, SSRComposeCoordinateValue>

export type SSRComposeStartConfig = {
  projectInputs: SSRComposeStartProjectsInput
  coordinateInputs: SSRComposeCoordinateInput
  dependenciesInputs: SSRComposeDependencies
}
