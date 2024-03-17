import styled from "@emotion/styled"

const HomeContainer = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh"
}))

export function HomeLayout() {
  return <HomeContainer></HomeContainer>
}
