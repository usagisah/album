import { AlbumSSRContext } from "albumjs/server"
import { createContext } from "react"

export const SSRContext = createContext<AlbumSSRContext>({} as any)
