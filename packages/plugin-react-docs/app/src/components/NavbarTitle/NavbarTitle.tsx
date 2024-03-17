import styled from "@emotion/styled"

const NavbarTitleContainer = styled.a`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  color: #3c3c43;
  pointer-events: none;

  .img {
    width: 24px;
    height: 24px;
  }
`

export function NavbarTitle() {
  return (
    <NavbarTitleContainer className="navbarTitle">
      <img className="img" src="" alt="" />
      <span></span>
    </NavbarTitleContainer>
  )
}
