import { AlbumSSRComposeContext } from "albumjs/server"
import { createContext } from "react"

export const SSRComposeContext = createContext<AlbumSSRComposeContext>({} as any)
