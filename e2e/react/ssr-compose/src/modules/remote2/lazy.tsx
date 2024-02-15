import { useServer } from "albumjs"
import { useState } from "react"
import "./style1.css"

export default function lazy() {
  useServer("remote2", async props => {
    return { "remote2-lazy": "remote2" }
  })
  const [n, add] = useState(0)
  return (
    <div id="remote2-lazy">
      <span>{n}</span>
      <button onClick={() => add(n + 1)}>++</button>
    </div>
  )
}
