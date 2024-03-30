import styled from "@emotion/styled"
import { usePage } from "album.docs"

const MainDocsContainer = styled.main`
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin: 100px auto 0 auto;
  padding: 0 24px;
  max-width: 1400px;

  .content {
    flex: 1;
    flex-direction: column;
    min-width: 800px;
    padding: 48px 32px;
    min-height: calc(100vh - 76px);
    background-color: ${({ theme }) => theme.white};
    border-radius: ${({theme}) => theme.radius.large};
  }

  .doc-footer {
    margin-top: 64px;
  }
`

export function MainDocs() {
  const { components } = usePage()
  const Sidebar = components["Sidebar"]
  const EditInfo = components["EditInfo"]
  const PrevNext = components["PrevNext"]
  const Category = components["Category"]
  const Content = components["Content"]
  return (
    <MainDocsContainer className="mainDocs">
      <Sidebar />
      <section className="content">
        <article className="article" suppressHydrationWarning={true}>
          <Content />
        </article>
        <section className="doc-footer">
          <EditInfo />
          <PrevNext />
        </section>
      </section>
      <Category />
    </MainDocsContainer>
  )
}
