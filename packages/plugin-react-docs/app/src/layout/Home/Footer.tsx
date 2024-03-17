import styled from "@emotion/styled"

const FooterContainer = styled.footer`
  position: relative;
  padding: 32px 24px;
  max-width: 1440px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-top: 1px solid #e2e2e3;

  @media (min-width: 768px) {
    .footer {
      padding: 32px;
    }
  }
`

export interface FooterProps {
  message: string
  copyright: string
}

export function Footer({ message, copyright }: FooterProps) {
  if (!message && !copyright) {
    return null
  }

  return (
    <FooterContainer className="footer">
      <p className="message" dangerouslySetInnerHTML={{ __html: message }}></p>
      <p className="copyright" dangerouslySetInnerHTML={{ __html: copyright }}></p>
    </FooterContainer>
  )
}
