import { useServer } from "album.server"
import { useState } from "react"
import "./style1.css"

export default function ff() {
  useServer("remote3", async props => {
    return { remote3: "remote3" }
  })
  const [n, add] = useState(0)
  return (
    <div id="remote3-lazy">
      <span>{n}</span>
      <button onClick={() => add(n + 1)}>++</button>
    </div>
  )
}
