import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { MainDocs } from "./MainDocs"

const DocsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 375px;
  min-height: 100vh;
  background: rgb(248, 249, 251);
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
