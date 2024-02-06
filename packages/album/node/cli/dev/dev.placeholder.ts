import { albumDevServer } from "./dev.js"

albumDevServer(JSON.parse(process.argv.slice(2)[1]))
