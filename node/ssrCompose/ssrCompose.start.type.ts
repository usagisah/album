export type SSRComposeStartCoordinateValue = {
  coordinate: Record<string, string>
  manifest: Record<string, any>
  ssrManifest: Record<string, string[]>
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

export type SSRComposeCoordinateValue = SSRComposeStartCoordinateValue | SSRComposeDevCoordinateValue
export type SSRComposeCoordinateInput = Map<string, SSRComposeCoordinateValue>

export type SSRComposeStartConfig = {
  projectInputs: SSRComposeStartProjectsInput
  coordinateInputs: SSRComposeCoordinateInput
  dependenciesInputs: SSRComposeDependencies
}
