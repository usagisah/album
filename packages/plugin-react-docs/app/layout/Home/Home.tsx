import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { MainHome } from "./MainHome"

const HomeContainer = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  minWidth: "375px",
  background: "rgb(248, 249, 251)"
}))

export function HomeLayout() {
  const { components } = usePage()
  const Header = components["Header"]
  const Footer = components["Footer"]
  return (
    <HomeContainer>
      <Header />
      <MainHome />
      <Footer />
    </HomeContainer>
  )
}
