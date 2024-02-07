import { Controller, Get, Module, Post } from "@w-hite/album/server"

@Controller()
class AppController {
  @Get("/oo")
  hello() {
    return { msg: "hello world" }
  }
}

export default function () {
  @Module({
    imports: [],
    controllers: [AppController]
  })
  class AppModule {}

  return AppModule
}
