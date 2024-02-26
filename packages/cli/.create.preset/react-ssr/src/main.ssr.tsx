import { SSRStoreId, SSRStoreProvide } from "@store/index"
import { AppRouterFunComponent } from "album"
import { SSRProps } from "album.server"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFunComponent, props: SSRProps) {
  const ssrStoreState = { from: "ssr-store" }
  return {
    Head: <Head />,
    App: (
      <>
        <script type="text/json" id={SSRStoreId} dangerouslySetInnerHTML={{ __html: JSON.stringify(ssrStoreState) }}></script>
        <div id="root">
          <SSRStoreProvide state={ssrStoreState}>
            <AppRouter Layout={App} />
          </SSRStoreProvide>
        </div>
      </>
    )
  }
}
