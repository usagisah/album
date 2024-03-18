import { NavItem } from "@docs/site-config"
import styled from "@emotion/styled"
import { SelectMenu } from "../SelectMenu/SelectMenu"

const NavBarContainer = styled.ul`
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 14px;
  font-weight: 500;
  color: #3c3c43;

  .item {
    cursor: pointer;
  }
`

export interface NavBarProps {
  list: NavItem[]
}

export function NavBar(props: NavBarProps) {
  const { list } = props
  return (
    <NavBarContainer className="navBar">
      {list.map((item, index) => (
        <SelectMenu key={index} navItems={item.items ?? []}>
          <li className="item">
            <a href={item.link}>{item.text}</a>
          </li>
        </SelectMenu>
      ))}
    </NavBarContainer>
  )
}
