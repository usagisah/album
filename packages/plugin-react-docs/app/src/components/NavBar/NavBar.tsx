import { MenuOutlined } from "@ant-design/icons"
import { NavItem } from "@docs/site-config"
import styled from "@emotion/styled"

const NavBarContainer = styled.ul`
  color: #3c3c43;
  font-size: 14px;
  font-weight: 500;

  .pc-nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .item {
    cursor: pointer;
  }

  @media (min-width: 760px) {
    .ipad-nav {
      display: none !important;
    }
  }

  @media (max-width: 760px) {
    .pc-nav {
      display: none;
    }
  }
`

export interface NavBarProps {
  list: NavItem[]
  SelectMenu: any
}

export function NavBar(props: NavBarProps) {
  const { list, SelectMenu } = props
  return (
    <NavBarContainer className="navBar">
      <div className="pc-nav">
        {list.map((item, index) => (
          <SelectMenu key={index} navItems={item.items ?? []}>
            <li className="item">
              <a href={item.link}>{item.text}</a>
            </li>
          </SelectMenu>
        ))}
      </div>

      <SelectMenu navItems={list} arrow={false} dropdownProps={{ className: "ipad-nav" }}>
        <MenuOutlined width={16} height={16} style={{ cursor: "pointer" }} />
      </SelectMenu>
    </NavBarContainer>
  )
}
