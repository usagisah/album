import styled from "@emotion/styled"
import { usePage } from "album.docs"

const ErrorContainer = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  minWidth: "375px",
  background: theme.bg.default,

  ".mainError": {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
  },

  ".code": {
    fontSize: "64px",
    fontWeight: "600",
    color: theme.text[1]
  },

  ".title": {
    fontSize: "22px",
    fontWeight: "700",
    color: theme.text[1]
  },

  ".divider": {
    margin: ".5rem 0",
    width: "64px",
    height: "1px",
    backgroundColor: theme.divider.default
  },

  ".message": {
    maxWidth: "256px",
    fontSize: "14px",
    fontWeight: "400",
    textAlign: "center",
    color: theme.text[2]
  },

  ".actions": {
    margin: "24px 0 18px 0",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem"
  },

  ".goHome": {
    padding: "4px 16px",
    fontSize: "14px",
    fontWeight: "400",
    color: theme.primary.default,
    border: `1px solid ${theme.primary.default}`,
    borderRadius: theme.radius.btn,
    transition: "all .25s,color .25s",
    cursor: "pointer",
    ":hover": {
      color: theme.primary.hover,
      border: `1px solid ${theme.primary.hover}`
    }
  }
}))

export function ErrorLayout() {
  const { components, frontmatter } = usePage()
  const Header = components["Header"]
  const Footer = components["Footer"]
  return (
    <ErrorContainer>
      <Header />
      <div className="mainError">
        <h2 className="code">404</h2>
        <h2 className="title">PAGE NOT FOUND</h2>
        <div className="divider"></div>
        {frontmatter.message && <div className="message" dangerouslySetInnerHTML={{ __html: frontmatter.message }}></div>}
        <div className="actions">
          <a className="goHome" href="/">
            Take me home
          </a>
        </div>
      </div>
      <Footer />
    </ErrorContainer>
  )
}
