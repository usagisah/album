import styled from "@emotion/styled"

const NavTitleContainer = styled.a`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.text[1]};

  .img {
    width: 24px;
    height: 24px;
  }
`

export interface NavTitleProps {
  title?: string
  path?: string
  logo?: string
}

export function NavTitle(props: NavTitleProps) {
  const { title = "", path = "/", logo } = props
  return (
    <NavTitleContainer className="navTitle" href={path}>
      {logo && <img className="img" src={logo} alt={title} />}
      <span>{title}</span>
    </NavTitleContainer>
  )
}
