import { watch } from "chokidar"
import { DevInputs } from "../inputs/inputs.type.js"

export function createWatcher({ albumConfigInput }: DevInputs, { module }: ClientConfig) {
  const modulePath = module?.modulePath
  const watcher = watch([albumConfigInput].concat(modulePath ? [modulePath] : []), {
    persistent: true,
    ignorePermissionErrors: true,
    useFsEvents: true,
    ignoreInitial: true,
    usePolling: false,
    interval: 100,
    awaitWriteFinish: true,
    binaryInterval: 300
  })
  return watcher
}
