import { Controller, Get, Post } from "@albumjs/album/server"

@Controller()
export class AppController {
  @Get("/api")
  get() {
    return { msg: "AppController-get" }
  }

  @Post("/api")
  post() {
    return { msg: "AppController-post" }
  }
}
