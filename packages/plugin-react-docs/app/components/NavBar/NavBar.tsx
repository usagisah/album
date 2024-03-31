import styled from "@emotion/styled"
import { LinkItem, usePage } from "album.docs"

const NavBarContainer = styled.ul`
  color: ${({ theme }) => theme.text[1]};
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

  .item.active {
    color: ${({ theme }) => theme.primary.default};
  }

  .item.active + .icon-down {
    color: ${({ theme }) => theme.primary.default};
    fill: ${({ theme }) => theme.primary.default};
  }

  .pc-nav .item:hover {
    color: ${({ theme }) => theme.primary.hover}!important;
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
  const { components, location } = usePage()
  const { IconMenuOutlined } = components
  const { list, SelectMenu } = props
  return (
    <NavBarContainer className="navBar">
      <div className="pc-nav">
        {list.map((item, index) => (
          <SelectMenu key={index} linkItems={item.children ?? []}>
            <li className={"item " + (location.pathname === item.link ? "active" : "")}>
              <a href={item.link}>{item.label}</a>
            </li>
          </SelectMenu>
        ))}
      </div>

      <SelectMenu linkItems={list} arrow={false} dropdownProps={{ className: "ipad-nav" }}>
        <IconMenuOutlined size={16} style={{ cursor: "pointer" }} />
      </SelectMenu>
    </NavBarContainer>
  )
}
