import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { Tabs } from "antd"
import { Suspense, createElement, lazy, useMemo, useRef, useState } from "react"

const DemoBoxContainer = styled.div(({ theme }) => ({
  width: "100%",
  margin: "1rem 0",
  padding: ".5rem",
  borderRadius: theme.radius.default,
  background: theme.bg.default,
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1),0 2px 4px -2px rgb(0 0 0 / 0.1)",

  ".demo": {
    padding: "40px 24px",
    background: theme.bg.default,
    borderBottom: "1px solid " + theme.border.default
  },

  ".ant-tabs-nav": {
    margin: "0"
  },

  ".ant-tabs-nav-operations": {
    display: "none!important"
  },

  ".actions": {
    display: "flex",
    gap: "4px",
    paddingLeft: "1rem"
  },

  ".u-code": {
    marginTop: "1rem"
  }
}))

export interface DemoBoxProps {
  component?: string
  tabItems: { label: string; code: string }[]
}

export function DemoBox(props: DemoBoxProps) {debugger
  const {} = usePage()
  const { tabItems, component } = props
  const [collapse, setCollapse] = useState(true)
  const items = useMemo(() => {
    return tabItems.map((item, index) => {
      return {
        key: index.toString(),
        label: item.label,
        children: <div style={{ display: collapse ? "none" : "block" }} dangerouslySetInnerHTML={{ __html: item.code }}></div>
      }
    })
  }, [collapse])
  const Comp = useRef(component && createElement(lazy(() => import(/*@vite-ignore*/ component))))
  return (
    <DemoBoxContainer>
      {component && (
        <div className="demo">
          <Suspense>{Comp.current}</Suspense>
        </div>
      )}
      <Tabs
        defaultActiveKey="1"
        tabBarExtraContent={{
          right: <Actions component={component} collapse={collapse} setCollapse={setCollapse} />
        }}
        items={items}
      />
    </DemoBoxContainer>
  )
}

function Actions({ collapse, setCollapse }: any) {
  return (
    <div className="actions">
      <span onClick={() => setCollapse(!collapse)}>{collapse ? "展开" : "折叠"}</span>
    </div>
  )
}
