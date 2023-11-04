import { Module } from "@nestjs/common"
import { AlbumContextModule } from "../context/album-context.module.js"
import { LoggerModule } from "../logger/logger.module.js"

@Module({
  imports: [LoggerModule, AlbumContextModule]
})
export class AppModule {}
