import { albumDevServer } from "@albumjs/album/service"

albumDevServer(JSON.parse(process.argv.slice(2)[1]))
