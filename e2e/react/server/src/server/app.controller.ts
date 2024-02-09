import { Controller, Get, Post } from "albumjs/server"

@Controller()
export class AppController {
  @Get("/oo")
  get() {
    return { msg: "AppController-get" }
  }

  @Post("/oo")
  post() {
    return { msg: "AppController-post" }
  }
}
