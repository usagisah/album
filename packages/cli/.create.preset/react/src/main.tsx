import { AppRouterFunComponent } from "album"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

export default function (AppRouter: AppRouterFunComponent) {
  createRoot(document.getElementById("root")!).render(<AppRouter Layout={App} />)
}
