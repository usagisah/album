import { FC } from "albumjs"

export const App: FC = ({ children }) => {
  return (
    <>
      <div id="router">{children}</div>
    </>
  )
}
