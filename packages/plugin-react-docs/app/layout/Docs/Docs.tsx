import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { MainDocs } from "./MainDocs"

const DocsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 375px;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg.content};
`

export function DocsLayout() {
  const { components } = usePage()
  const Header = components["Header"]
  const Footer = components["Footer"]
  return (
    <DocsContainer className="docs">
      <Header />
      <MainDocs />
      <Footer />
    </DocsContainer>
  )
}
