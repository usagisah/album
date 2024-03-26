import { Obj } from "@albumjs/tools/node"
import { INestApplication } from "@nestjs/common"
import { ViteDevServer } from "vite"

export type ServerManagerAppModule = {
  filename: string
  input: string | null
  output: string | null
}

export type ServerManagerTsconfig = Obj | null

export type ServerManager = {
  port: number
  appModule: ServerManagerAppModule
  builtinModules: boolean
  tsconfig: ServerManagerTsconfig
  nestServer: INestApplication<any> | null
  viteServer: ViteDevServer | null
}
