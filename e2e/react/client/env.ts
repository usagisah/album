import { UserConfigEnv } from "@albumjs/album/server"

export default {
  common: { p: "file-common-p" },
  development: { z: "file-dev-z" },
  production: { z: "file-dev-z" }
} as UserConfigEnv
