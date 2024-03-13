import { AppRouterFunComponent } from "album"
import { hydrateRoot } from "react-dom/client"
import { App } from "./App"

export default function (AppRouter: AppRouterFunComponent) {
  hydrateRoot(document.getElementById("root")!, <AppRouter Layout={App} />)
}
