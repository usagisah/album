import { DownOutlined } from "@ant-design/icons"
import { NavItem } from "@docs/site-config"
import { Menu, Popover } from "antd"
import { ReactNode, useRef } from "react"

export interface SelectMenuProps {
  navItems: NavItem[]
  children: ReactNode
}

export function SelectMenu(props: SelectMenuProps) {
  const { navItems, children } = props
  if (navItems.length === 0) {
    return children
  }

  const items = useRef(transformItems(navItems))
  return (
    <Popover placement="bottom" content={<Menu style={{ border: "none" }} items={items.current} />}>
      <div style={{ display: "flex", gap: "4px", alignItems: "center", cursor: "pointer" }}>
        {children}
        <DownOutlined style={{ width: "8px", height: "8px" }} />
      </div>
    </Popover>
  )
}

interface MenuItem {
  key: string
  label: string
  type?: string
  children?: MenuItem[]
}
function transformItems(items: NavItem[]): MenuItem[] {
  return items.map((item, index) => {
    const { text, items, ...o } = item
    return {
      key: item.link ?? index.toString(),
      label: item.text ?? "",
      children: item.items && transformItems(item.items),
      ...o
    }
  })
}
