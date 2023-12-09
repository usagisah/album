export type DevInputs = {
  cwd: string
  root: string
  dumpInput: string
  albumConfigInput: string
}

export type StartInputs = {
  cwd: string
  root: string | null
  clientInput: string | null
  ssrInput: string | null
  mainSSRInput: string | null
  apiAppInput: string | null
}
