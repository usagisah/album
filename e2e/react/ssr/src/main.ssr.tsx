import { AppRouterFC, SSRProps } from "albumjs"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFC, props: SSRProps) {
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
    data: { aa: "server-router-mainSSR" }
  }
}
