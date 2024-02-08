import { Outlet } from "react-router-dom"

export default function Page() {
  return (
    <>
      <h1 id="home">page home</h1>
      <Outlet />
    </>
  )
}
