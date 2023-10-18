import type { ILogger } from "./logger.type.js"
import { Injectable } from "@nestjs/common"
import { Logger } from "./logger.js"

@Injectable()
export class AlbumLoggerService extends Logger implements ILogger {}
