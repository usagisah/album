import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { Switch } from "antd"
import { Github } from "../../components/Github/Github"
import { Lang } from "../../components/Lang/Lang"

const HeaderContainer = styled.header`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding: 0 8px 0 24px;
  height: 64px;
  white-space: nowrap;

  .container {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    max-width: 1360px;
    width: 100%;
    height: 100%;
  }

  .container .left,
  .right {
    display: flex;
    align-items: center;
    height: 64px;
  }

  @media (min-width: 960px) {
    position: fixed;
    padding: 0px 32px;
    /* border-bottom: 1px solid #e2e2e3; */
  }
`

function Divider() {
  return <div style={{ margin: "0 1rem", width: "1px", height: "24px", background: "#e2e2e3" }}></div>
}

export function Header() {
  const { site, navList, components } = usePage()
  const NavTitle = components["NavTitle"]
  const NavSearch = components["NavSearch"]
  const NavBar = components["NavBar"]
  return (
    <HeaderContainer className="header">
      <div className="container">
        <section className="left">
          <NavTitle title={site.title} path={site.path} logo={site.logo} />
          <div style={{width: "2rem"}}></div>
          <NavBar list={navList} />
        </section>
        <section className="right">
          <NavSearch />
          <Divider />
          <Lang />
          <Divider />
          <Switch />
          <Divider />
          <Github />
        </section>
      </div>
    </HeaderContainer>
  )
}
