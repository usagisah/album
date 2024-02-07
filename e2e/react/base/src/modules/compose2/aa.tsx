import { useServerData } from "albumjs"
import "./style1.css"
import { useState } from "react"

export default function ff() {
  const data = useServerData("test-ssr-compose", async (props) => {
    return ({ a: 10 })
  })
  const [n, add] = useState(0)
  return <div>
    child component - {JSON.stringify(data)}

    <div>{n} <button onClick={() => add(n + 1)}>++</button></div>
  </div>
}