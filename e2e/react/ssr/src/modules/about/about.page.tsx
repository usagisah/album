import { Outlet } from "react-router-dom"

export default function Page() {
  return (
    <>
      <h1 id="about">page about</h1>
      <Outlet />
    </>
  )
}
