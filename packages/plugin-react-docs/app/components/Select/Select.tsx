import styled from "@emotion/styled"
import { LinkItem, usePage } from "album.docs"
import { ReactNode } from "react"

export interface SelectMenuProps extends React.ClassAttributes<HTMLDivElement>, React.HTMLAttributes<HTMLDivElement> {
  linkItems: LinkItem[]
  children: ReactNode
  arrow?: boolean
  defaultSelected?: any
}

const SelectContainer = styled.div(({ theme }) => ({
  position: "relative",
  ".content": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    width: "fit-content",
    height: "fit-content"
  },
  ".select": {
    position: "absolute",
    display: "block",
    opacity: "0",
    inset: 0,
    cursor: "pointer"
  }
}))

export function Select(props: SelectMenuProps) {
  const { components } = usePage()
  const { IconDown } = components
  const { linkItems = [], arrow = true, children, defaultSelected, ..._props } = props
  return (
    <SelectContainer {..._props}>
      <div className="content">
        {children}
        {arrow && <IconDown />}
      </div>
      <select className="select" onChange={e => (location.href = e.target.value)} value={defaultSelected ?? "_null"}>
        <option value="_null" disabled>
          place select one
        </option>
        {linkItems.map((item, index) => {
          const { label, link } = item
          return <option key={link + "_" + index} value={link} dangerouslySetInnerHTML={{ __html: label }}></option>
        })}
      </select>
    </SelectContainer>
  )
}
