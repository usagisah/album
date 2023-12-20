import { AlbumContext as AlbumDevContext } from "../../context/context.dev.type.js"
import { AlbumContext as AlbumStartContext } from "../../context/context.start.type.js"

export type AlbumContext = AlbumDevContext | AlbumStartContext
