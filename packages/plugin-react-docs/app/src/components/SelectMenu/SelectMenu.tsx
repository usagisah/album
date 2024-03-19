import { DownOutlined } from "@ant-design/icons"
import { NavItem } from "@docs/site-config"
import { Dropdown, DropdownProps } from "antd"
import { ReactNode, useRef } from "react"

export interface SelectMenuProps extends React.ClassAttributes<HTMLDivElement>, React.HTMLAttributes<HTMLDivElement> {
  arrow?: boolean
  navItems: NavItem[]
  children: ReactNode
  dropdownProps?: DropdownProps
}

export function SelectMenu(props: SelectMenuProps) {
  const { arrow = true, navItems, children, dropdownProps, ..._props } = props
  if (navItems.length === 0) {
    return children
  }

  const items = useRef(transformItems(navItems))
  return (
    <Dropdown placement="bottom" menu={{ items: items.current, style: { border: "none" } }} {...dropdownProps}>
      <div style={{ display: "flex", gap: "4px", alignItems: "center", cursor: "pointer" }} {..._props}>
        {children}
        {arrow && <DownOutlined style={{ width: "8px", height: "8px" }} />}
      </div>
    </Dropdown>
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
