import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { FC } from "album"

const StyledH1 = styled.h1`
  color: slateblue;
`

export const App: FC = ({ children }) => {
  return (
    <>
      <h1
        id="inline-css"
        css={css`
          color: red;
        `}
      >
        inline style
      </h1>
      <StyledH1 id="styled-css">styled component</StyledH1>
      <div>{children}</div>
    </>
  )
}
