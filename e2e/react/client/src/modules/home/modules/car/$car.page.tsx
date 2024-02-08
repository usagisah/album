import { useParams } from "react-router-dom"

export default function Page() {
  return <h1 id="car">page car--{JSON.stringify(useParams())}</h1>
}
