import { useServer } from "album.server"
import { useState } from "react"
import "./style1.css"

export default function ff() {
  useServer("local3", async props => {
    return { "local3-lazy": 10 }
  })
  const [n, add] = useState(0)
  return (
    <div id="local3-lazy">
      <span>{n}</span>
      <button onClick={() => add(n + 1)}>++</button>
    </div>
  )
}
