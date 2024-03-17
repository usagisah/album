import styled from "@emotion/styled"
import { usePage } from "album.docs"

const HeaderContainer = styled.header`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  padding: 0 8px 0 24px;
  height: 64px;
  white-space: nowrap;
  pointer-events: none;

  .content {
    display: flex;
    justify-content: space-between;
    max-width: 1360px;
    width: 100%;
    height: 100%;
  }

  @media (min-width: 960px) {
    .header {
      position: fixed;
      padding: 0px 32px;
      border-bottom: 1px solid #e2e2e3;
    }
  }
`

export function Header() {
  const { components } = usePage()
  const NavbarTitle = components["NavbarTitle"]
  return (
    <HeaderContainer className="header">
      <div className="content">
        <NavbarTitle />
      </div>
    </HeaderContainer>
  )
}
