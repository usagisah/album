import { Injectable } from "@nestjs/common"
import { AlbumContext } from "../../context/AlbumContext.js"

@Injectable()
export class AlbumContextService {
  private context: AlbumContext
  private pending: any[] = []

  async getContext() {
    if (!this.context) {
      return new Promise<AlbumContext>(r => {
        this.pending.push(() => {
          r(this.context)
        })
      })
    }

    return this.context
  }

  setContext(ctx: AlbumContext) {
    this.context = ctx
    this.pending.forEach(f => f())
    this.pending = []
  }
}
