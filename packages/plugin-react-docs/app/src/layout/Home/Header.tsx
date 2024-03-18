import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { Dropdown, Switch } from "antd"
import { CSSProperties, useRef, useState } from "react"
import { Github } from "../../components/Github/Github"
import { Lang } from "../../components/Lang/Lang"
import { useScroll } from "../../hooks/useScroll"

const HeaderContainer = styled.header`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding: 0 24px 0 24px;
  height: 64px;
  border-bottom: 1px solid transparent;
  white-space: nowrap;
  transition: all .5s;

  .container {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    max-width: 1360px;
    width: 100%;
    height: 100%;
  }

  .container .nav-list,
  .pc-actions {
    display: flex;
    align-items: center;
    height: 64px;
  }

  .ipad-actions {
    display: none;
  }

  @media (min-width: 960px) {
    position: fixed;
    padding: 0px 32px;
  }

  @media (max-width: 1024px) {
    .pc-actions {
      display: none;
    }

    .ipad-actions {
      display: flex;
      align-items: center;
      height: 64px;
    }
  }
`

function Divider() {
  return <div style={{ margin: "0 1rem", width: "1px", height: "24px", background: "#e2e2e3" }}></div>
}

export function Header() {
  const { site, navList, components } = usePage()
  const NavTitle = components["NavTitle"]
  const NavBar = components["NavBar"]

  const [style, setStyle] = useState<CSSProperties>({})
  useScroll(() => {
    if (window.innerWidth < 1000) {
      return
    }
    const isScrollTop = window.scrollY === 0
    if (isScrollTop) {
      if (style.borderBottom) {
        setStyle({})
      }
      return
    }

    if (!style.borderBottom) {
      setStyle({ background: "white", borderBottom: "1px solid #e2e2e3" })
    }
  })
  return (
    <HeaderContainer className="header" style={style}>
      <div className="container">
        <section className="nav-list">
          <NavTitle title={site.title} path={site.path} logo={site.logo} />
          <div style={{ width: "2rem" }}></div>
          <NavBar list={navList} />
        </section>
        <PCActions />
        <IpadDropdown />
      </div>
    </HeaderContainer>
  )
}

function PCActions() {
  const { components } = usePage()
  const NavSearch = components["NavSearch"]
  return (
    <div className="pc-actions">
      <NavSearch />
      <Divider />
      <Lang />
      <Divider />
      <Switch />
      <Divider />
      <Github />
    </div>
  )
}

function IpadDropdown() {
  const { components, lang } = usePage()
  const NavSearch = components["NavSearch"]
  const menuItems = useRef<any[]>()
  if (!menuItems.current) {
    const items: any[] = lang.map(item => ({
      key: item.link,
      label: (
        <a href={item.link}>
          {item.text} {item.icon}
        </a>
      )
    }))
    items.push({ type: "divider" })
    items.push(
      ...[
        {
          key: "aaa",
          label: <a>亮色</a>
        },
        {
          key: "bbb",
          label: <a>暗色</a>
        }
      ]
    )
    items.push({ type: "divider" })
    items.push({ key: "github", label: <Github /> })
    menuItems.current = items
  }
  return (
    <div className="ipad-actions">
      <NavSearch mobile />
      <Divider />
      <Dropdown placement="bottomRight" arrow menu={{ items: menuItems.current ?? [] }}>
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4200" width="14" height="14">
          <path
            d="M213.333333 512a85.333333 85.333333 0 1 1-85.333333-85.333333 85.333333 85.333333 0 0 1 85.333333 85.333333z m298.666667-85.333333a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z m384 0a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z"
            fill="#5C5C66"
            p-id="4201"
          ></path>
        </svg>
      </Dropdown>
    </div>
  )
}
