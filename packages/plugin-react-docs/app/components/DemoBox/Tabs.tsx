import { ReactNode, useMemo, useState } from "react"
import styled from "@emotion/styled"

export type TabItem = {
  key: string
  label: string
  children: ReactNode
}
export type TabsProps = {
  defaultActiveKey: any
  items: TabItem[]
}


const TabsContainer = styled.div(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",

  ".tabNav": {
    width: "100%",
    overflowX: "auto",
    display: "flex",
    alignItems: "center",
    gap: "32px",
    fontSize: "14px",
    flexShrink: 0,

    ".item" : {
      padding: "12px 0",
      cursor: "pointer",
      userSelect: "none",

      ":hover": {
        color: theme.primary.hover
      }
    },

    ".active": {
      color: theme.primary.hover
    },

    "&.empty": {
      height: "0"
    }
  },

  ".tabActive": {
    color: theme.primary.default
  },

  ".tabDivider": {
    width: "100%",
    height: "1px",
    background: theme.divider.default,
    marginBottom: "12px"
  },

  ".tabContent": {
    flex: "1",

    ".u-code": {
      margin: "0",
      padding: 0,
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
  
      pre: {
        background: `transparent!important`
      }
    }
  }
}))

export function Tabs({ defaultActiveKey, items }: TabsProps) {
  const [current, setCurrent] = useState<null | TabItem>(() => {
    if (defaultActiveKey !== undefined) {
      return items.find(v => v.key === defaultActiveKey) as TabItem
    }
    return null
  })
  const emptyLabels = useMemo(() => {
    return items.length === 0 || items.every(v => v.label.length === 0)
  }, items)
  
  return <TabsContainer>
    <div className={"tabNav " + (emptyLabels ? "empty" : "")}>
      {items.map((item, index) => <div className={"item " + (item.key === current?.key ? 'active' : '')} key={item.key} onClick={() => setCurrent(item)}>{item.label}</div>)}
    </div>
    { !emptyLabels && <div className="tabDivider"></div> }
    <div className="tabContent">
      {current && current.children}
    </div>
  </TabsContainer>
}