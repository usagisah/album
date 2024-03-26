import { Link, Outlet } from "react-router-dom"

export default function Page() {
  return (
    <div id="push">
      <ul>
        <li>
          <Link to="/push/p1" id="btn1">
            to push-page1
          </Link>
        </li>
        <li>
          <Link to="/push/p2" id="btn2">
            to push-page2
          </Link>
        </li>
        <li>
          <Link to="/" id="btn3">
            to home
          </Link>
        </li>
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}
