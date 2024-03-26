import { LinkItem } from "@docs/site-config"
import { Dropdown, DropdownProps } from "antd"
import { ReactNode, useRef } from "react"

export interface SelectMenuProps extends React.ClassAttributes<HTMLDivElement>, React.HTMLAttributes<HTMLDivElement> {
  arrow?: boolean
  linkItems: LinkItem[]
  children: ReactNode
  dropdownProps?: DropdownProps
}

export function SelectMenu(props: SelectMenuProps) {
  const { arrow = true, linkItems = [], children, dropdownProps, ..._props } = props
  if (linkItems.length === 0) {
    return children
  }

  const items = useRef(transformItems(linkItems))
  return (
    <Dropdown placement="bottom" menu={{ items: items.current, style: { border: "none" } }} {...dropdownProps}>
      <div style={{ display: "flex", gap: "4px", alignItems: "center", cursor: "pointer" }} {..._props}>
        {children}
        {arrow && 1}
      </div>
    </Dropdown>
  )
}

function transformItems(items: LinkItem[]): (LinkItem & { key: string })[] {
  if (!items) {
    return []
  }
  return items.map((item, index) => {
    return {
      ...item,
      key: item.link ?? index + "",
      children: item.children && transformItems(item.children)
    }
  })
}
