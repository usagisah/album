import styled from "@emotion/styled"
import { usePage } from "album.docs"
import Test from "../../test.md"
import siteConfig from "@docs/site-config"

const MainDocsContainer = styled.main`
  display: flex;
  gap: 4rem;
  margin: 100px auto 0 auto;
  padding: 0 24px;
  max-width: 1400px;

  .content {
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    min-width: 800px;
    padding: 48px 32px;
    min-height: calc(100vh - 76px);
    background-color: white;
    border-radius: 12px;
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
  console.log( siteConfig )
  return (
    <MainDocsContainer className="mainDocs">
      <Sidebar />
      <section className="content">
        <article className="article">
          <Test />
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
