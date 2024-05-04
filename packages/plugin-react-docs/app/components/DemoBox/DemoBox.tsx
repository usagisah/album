import styled from "@emotion/styled"
import { Tabs } from "antd"
import { Children, Suspense, createElement, useEffect, useMemo, useState } from "react"

const DemoBoxContainer = styled.div(({ theme }) => ({
  width: "100%",
  margin: "1rem 0",
  padding: ".5rem",
  borderRadius: theme.radius.default,
  background: theme.bg.demo,
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1),0 2px 4px -2px rgb(0 0 0 / 0.1)",

  ".demo": {
    padding: "40px 24px",
    background: theme.default,
    borderRadius: theme.radius.large
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
    marginTop: "1rem",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",

    pre: {
      background: `transparent!important`
    }
  }
}))

export interface DemoBoxProps {
  client?: string
  children: any[]
}

export function DemoBox(props: DemoBoxProps) {
  const { client, children } = props
  const items = useMemo(() => {
    return Children.map(children, (item, i) => {
      return {
        key: i.toString(),
        label: item.props["data-label"],
        children: item
      }
    })
  }, [])

  return (
    <DemoBoxContainer>
      <Suspense>
        <LazyComponent client={client} />
      </Suspense>
      <Tabs defaultActiveKey="0" items={items} />
    </DemoBoxContainer>
  )
}

function LazyComponent({ client }: { client?: string }) {
  if (!client) {
    return <div></div>
  }

  const [Comp, setComp] = useState<any>(null)
  useEffect(() => {
    import(/*@vite-ignore*/ client!).then(res => {
      setComp(createElement(res.default))
    })
  }, [])
  return <div className="demo">{Comp}</div>
}
