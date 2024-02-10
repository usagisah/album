import { AppRouterFC, SSRProps } from "albumjs"
import { App } from "./App"
import { Head } from "./Head"

export default function mainSSR(AppRouter: AppRouterFC, props: SSRProps) {
  console.log( "mainSSR props", props.params, props.query )
  return {
    Head: <Head />,
    App: (
      <div id="root">
        <AppRouter Layout={App} />
      </div>
    ),
    data: { aa: "server-router-data222" }
  }
}
