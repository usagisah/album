import { Module } from "@albumjs/album/server"
import { AppController } from "./server/app.controller"

@Module({
  imports: [],
  controllers: [AppController]
})
class AppModule {}

export default () => {
  return AppModule
}
