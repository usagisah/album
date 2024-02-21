import { AlbumSSRContext } from "@albumjs/album/server"
import { createContext } from "react"

export const SSRContext = createContext<AlbumSSRContext>({} as any)
