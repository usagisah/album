import { AlbumSSRComposeContext } from "@albumjs/album/server"
import { createContext } from "react"

export const SSRComposeContext = createContext<AlbumSSRComposeContext>({} as any)
