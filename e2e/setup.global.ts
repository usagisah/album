import { killActiveProject } from "./helpers/killActiveProject"

export async function setup() {
  await killActiveProject()
}

export async function teardown() {
  await killActiveProject()
}
