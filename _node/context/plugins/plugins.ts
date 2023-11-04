import EventEmitter from "events"
import { AlbumUserPlugin } from "./plugin.type.js"

export function normalizePlugins(plugins: AlbumUserPlugin[] = []) {
  return {
    events: new EventEmitter(),
    plugins
  }
}
