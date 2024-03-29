import { useServer } from "album.server"
import { useState } from "react"
import "./style1.css"

export default function ff() {
  useServer("local2", async props => {
    return { local2: "local2" }
  })
  const [n, add] = useState(0)
  return (
    <div id="local2-lazy">
      <span>{n}</span>
      <button onClick={() => add(n + 1)}>++</button>
    </div>
  )
}
