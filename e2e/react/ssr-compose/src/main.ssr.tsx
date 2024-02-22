import { AppRouterFC, SSRProps } from "album"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFC, props: SSRProps) {
  return {
    Head: <Head />,
    App: (
      <div id="root">
        <AppRouter Layout={App} />
      </div>
    )
  }
}
