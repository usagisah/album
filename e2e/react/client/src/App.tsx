import { FC } from "albumjs"

export const App: FC = ({ children }) => {
  console.log( import.meta.env )
  return (
    <>
      <div id="env">
        <p>{import.meta.env.a}</p>
        <p>{import.meta.env.b}</p>
        <p>{import.meta.env.p}</p>
        <p>{import.meta.env.z}</p>
      </div>
      <div id="router">{children}</div>
    </>
  )
}
