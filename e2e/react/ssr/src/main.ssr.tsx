import { AppRouterFunComponent } from "album"
import { MainSSRApp, SSRProps } from "album.server"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFunComponent, props: SSRProps): MainSSRApp {
  return {
    Head: <Head />,
    App: (
      <>
        <div id="server-params">{JSON.stringify(props.params)}</div>
        <div id="server-query">{JSON.stringify(props.query)}</div>
        <div id="root">
          <AppRouter Layout={App} />
        </div>
      </>
    ),
    data: { mainSSR: "server-router-mainSSR" }
  }
}
