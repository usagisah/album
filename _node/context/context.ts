import { CreateContextParams } from "./context.type.js"
import { buildDevInputs } from "./inputs/mountInputs.dev.js"
import { loadDevConfig } from "./userConfig/loadConfig.dev.js"
// import {  } from "./context.type.js"

export async function createAlbumDevContext(params: CreateContextParams) {
  const { mode, serverMode, args } = params
  const inputs = buildDevInputs()
  const userConfig = await loadDevConfig({ mode, args, inputs })
}

export async function createAlbumStartContext() {}
