import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

export default function (AppRouter: any) {
  createRoot(document.getElementById("root")!).render(<AppRouter Layout={App} />)
}
