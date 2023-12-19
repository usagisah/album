export type SSRComposeProjectInputs = Map<
  string,
  | {
      type: "local"
    }
  | {
      type: "start"
      clientInput: string
      ssrInput: string
      mainServerInput: string
      [x: string]: any
    }
>

export type SSRComposeCoordinateValue = {
  devFilepath: string
}

export type SSRComposeManager = {
  // projectInputs: SSRComposeProjectInputs
  dependencies: string[]
  castExtensions: string[]
}
