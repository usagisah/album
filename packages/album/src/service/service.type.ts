import { NodeArgs } from "@albumjs/tools/node"

export type ServerMode = "dev" | "build" | "start"

export type DevServerParams = {
  appId: string
  args: NodeArgs
}

export type StartServerParams = {
  args: NodeArgs
}
