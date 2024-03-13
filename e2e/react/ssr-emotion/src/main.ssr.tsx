import { AppRouterFunComponent } from "album"
import { SSRProps } from "album.server"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFunComponent, props: SSRProps) {
  return {
    Head: <Head />,
    App: (
      <>
        <div id="root">
          <AppRouter Layout={App} />
        </div>
      </>
    )
  }
}
