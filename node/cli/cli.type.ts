import { NodeArgs } from "../utils/command/args.js"

export type ServerMode = "dev" | "build" | "start"

export type DevServerParams = {
  appId: string
  args: NodeArgs
}

export type StartServerParams = {
  args: NodeArgs
}
