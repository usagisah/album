import { AlbumUserConfig } from "./user/user.dev.type.js"
export function defineAlbumConfig<T extends object = {}>(config: AlbumUserConfig & T) {
  return config
}
