import type { AlbumSSRContext } from "@albumjs/album/server"
import React from "react"

export const SSRContext = React.createContext<AlbumSSRContext>(null as any)
