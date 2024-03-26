import { LinkItem } from "@docs/site-config"
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
  list: LinkItem[]
  SelectMenu: any
}

export function NavBar(props: NavBarProps) {
  const { list, SelectMenu } = props
  return (
    <NavBarContainer className="navBar">
      <div className="pc-nav">
        {list.map((item, index) => (
          <SelectMenu key={index} linkItems={item.children ?? []}>
            <li className="item">
              <a href={item.link}>{item.label}</a>
            </li>
          </SelectMenu>
        ))}
      </div>

      <SelectMenu linkItems={list} arrow={false} dropdownProps={{ className: "ipad-nav" }}>
        {/* <MenuOutlined width={16} height={16} style={{ cursor: "pointer" }} /> */}
      </SelectMenu>
    </NavBarContainer>
  )
}
