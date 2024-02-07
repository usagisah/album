import { FC } from "albumjs"
import { ReactNode, createContext, useState } from "react"
import reactLogo from "@assets/react.svg"
import viteLogo from "/vite.svg"
import { Link } from "react-router-dom"


export const App: FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <li>
          <Link to="/">to home</Link>
        </li>
        <li>
          <Link to="/car">to car</Link>
        </li>
        <li>
          <Link to="/order">to order</Link>
        </li>
        <li>
          <Link to="/about">to about</Link>
        </li>
        <li>
          <Link to="/xxx/error">error</Link>
        </li>

        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {children}
    </>
  )
}
