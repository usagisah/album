import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { IpadActions, PCActions } from "./Actions"
import { useHeaderScroll } from "./useHeaderScroll"

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
  transition: all 0.5s;

  .container {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    max-width: 1360px;
    width: 100%;
    height: 100%;
  }

  .nav-list {
    display: flex;
    align-items: center;
    height: 64px;
  }
  @media (min-width: 960px) {
    position: fixed;
    padding: 0px 32px;
  }
`
export function Header() {
  const { navList, components } = usePage()
  const NavTitle = components["NavTitle"]
  const NavBar = components["NavBar"]
  const SelectMenu = components["SelectMenu"]
  const scrollStyle = useHeaderScroll()

  return (
    <HeaderContainer className="header" style={scrollStyle}>
      <div className="container">
        <section className="nav-list">
          <NavTitle />
          <div style={{ width: "2rem" }}></div>
          <NavBar list={navList} SelectMenu={SelectMenu} />
        </section>
        <PCActions />
        <IpadActions />
      </div>
    </HeaderContainer>
  )
}
