import { Global, Module } from "@nestjs/common"
import { AlbumLoggerService } from "./logger.service.js"

@Global()
@Module({
  providers: [AlbumLoggerService],
  exports: [AlbumLoggerService]
})
export class LoggerModule {}
