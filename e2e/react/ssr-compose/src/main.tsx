import "@assets/style.scss"
import { hydrateRoot } from "react-dom/client"
import { App } from "./App"

export default function (AppRouter: any) {
  hydrateRoot(document.getElementById("root")!, <AppRouter Layout={App} />)
}
