import styled from "@emotion/styled"
import { usePage } from "album.docs"

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

  .svg-logo {
    width: 30px;
    height: 30px;
  }
`

export function NavTitle() {
  const { title, logo } = usePage()
  const { url, href } = logo

  return (
    <NavTitleContainer className="navTitle" href={url}>
      {logo && <img className="img" src={href} alt={title.value} />}
      <span>{title.value}</span>
    </NavTitleContainer>
  )
}
