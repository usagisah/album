import reactLogo from "@assets/react.svg"
import { useCount } from "@hooks/useCount"
import { useBearStore, useSSRStore } from "@store/index"
import { FC } from "album"
import { Link } from "react-router-dom"
import viteLogo from "/vite.svg"

export const App: FC = ({ children }) => {
  const [count, increase] = useCount(0)
  const { bears, increaseBears } = useBearStore()
  const ssrStore = useSSRStore()
  console.log(ssrStore)
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={increase}>useState:count is {count}</button>
        <button onClick={() => increaseBears(1)}>store:bears is {bears}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <h2>current-page, click to other Page.</h2>
        <ul>
          <Link to="/">home</Link>
          <Link to="/xx">error</Link>
        </ul>
        <div>{children}</div>
      </div>
    </>
  )
}
