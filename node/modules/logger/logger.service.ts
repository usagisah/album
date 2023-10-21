import { Injectable } from "@nestjs/common"
import { Logger } from "./logger.js"
import type { ILogger } from "./logger.type.js"

@Injectable()
export class AlbumLoggerService extends Logger implements ILogger {}
