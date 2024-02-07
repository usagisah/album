import { createRoot, hydrateRoot } from "react-dom/client"
import { App } from "./App"
import "@assets/style.scss"



export default function (AppRouter: any) {
  // createRoot(document.getElementById("root")!).render(<AppRouter Layout={App} />)
  hydrateRoot(document.getElementById("root")!, <AppRouter Layout={App} />)
}
