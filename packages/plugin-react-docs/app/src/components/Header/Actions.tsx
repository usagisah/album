import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { Dropdown } from "antd"
import { useRef } from "react"
import { Divider } from "./Divider"

const PCActionsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 64px;

  @media (max-width: 1024px) {
    display: none;
  }
`
export function PCActions() {
  const { components } = usePage()
  const NavSearch = components["NavSearch"]
  const Lang = components["Lang"]
  const Switch = components["Switch"]
  const Github = components["Github"]
  return (
    <PCActionsContainer className="pc-actions">
      <NavSearch />
      <Divider />
      <Lang />
      <Divider />
      <Switch />
      <Divider />
      <Github />
    </PCActionsContainer>
  )
}

const IpadActionsContainer = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    height: 64px;
  }
`
export function IpadActions() {
  const { components, lang } = usePage()
  const NavSearch = components["NavSearch"]
  const Github = components["Github"]

  const menuItems = useRef<any[]>()
  if (!menuItems.current) {
    const items: any[] = []
    if (lang.length > 0) {
      const children: any[] = lang.map(item => ({
        key: item.link,
        label: (
          <a href={item.link}>
            {item.label} {item.icon}
          </a>
        )
      }))
      items.push({ type: "group", key: 1, label: "语言", children })
      items.push({ type: "divider" })
    }
    items.push({
      type: "group",
      key: 2,
      label: "主题",
      children: [
        {
          key: "aaa",
          label: <a>亮色</a>
        },
        {
          key: "bbb",
          label: <a>暗色</a>
        }
      ]
    })
    items.push({ type: "divider" })
    items.push({ key: "github", label: <Github /> })
    menuItems.current = items
  }
  return (
    <IpadActionsContainer className="ipad-actions">
      <NavSearch mobile />
      <Divider />
      <Dropdown placement="bottomRight" arrow menu={{ items: menuItems.current ?? [] }}>
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4200" width="14" height="14" style={{ cursor: "pointer" }}>
          <path
            d="M213.333333 512a85.333333 85.333333 0 1 1-85.333333-85.333333 85.333333 85.333333 0 0 1 85.333333 85.333333z m298.666667-85.333333a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z m384 0a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z"
            fill="#5C5C66"
            p-id="4201"
          ></path>
        </svg>
      </Dropdown>
    </IpadActionsContainer>
  )
}
