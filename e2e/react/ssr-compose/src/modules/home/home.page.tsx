import "./home.css"
import { Outlet } from "react-router-dom";

export default function Page() {
  return <>
    <h1>page Home</h1>
    <Outlet />
  </>
}