import { Module } from "albumjs/server"
import { AppController } from "./server/app.controller"

@Module({
  imports: [],
  controllers: [AppController]
})
class AppModule {}

export default (...a) => {
  console.log(a)
  return AppModule
}
