import { Module } from "@nestjs/common"
import { LoggerModule } from "../logger/logger.module.js"
import { AlbumContextModule } from "../context/album-context.module.js"

@Module({
  imports: [LoggerModule, AlbumContextModule]
})
export class AppModule {}
