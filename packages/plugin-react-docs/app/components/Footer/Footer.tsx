import styled from "@emotion/styled"
import { usePage } from "album.docs"

const FooterContainer = styled.footer`
  position: relative;
  padding: 32px 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.text[2]};

  .content {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 1440px;
    overflow: hidden;
  }

  @media (min-width: 768px) {
    padding: 32px;
  }
`

export function Footer() {
  const { message, copyright } = usePage().footer
  if (!message && !copyright) {
    return null
  }

  return (
    <FooterContainer className="footer">
      <div className="content">
        <p className="message" dangerouslySetInnerHTML={{ __html: message }}></p>
        <p className="copyright" dangerouslySetInnerHTML={{ __html: copyright }}></p>
      </div>
    </FooterContainer>
  )
}
