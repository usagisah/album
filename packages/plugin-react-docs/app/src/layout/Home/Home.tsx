import styled from "@emotion/styled"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { MainHome } from "./MainHome"

const HomeContainer = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh"
}))

export function HomeLayout() {
  return (
    <HomeContainer>
      <Header />
      <MainHome />
      <Footer />
    </HomeContainer>
  )
}
