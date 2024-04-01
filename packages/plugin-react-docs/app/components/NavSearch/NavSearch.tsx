import styled from "@emotion/styled"

const NavSearchContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px 0 12px;
  height: 40px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.divider.default};
  border-radius: ${({ theme }) => theme.radius.default};

  &:hover {
    background: ${({ theme }) => theme.default};
    color: ${({ theme }) => theme.primary.default};
    fill: ${({ theme }) => theme.primary.default};
    border: 1px solid ${({ theme }) => theme.primary.default};
  }

  .placeholder {
    margin: 0 1rem 0 8px;
  }

  .pointKeys {
    padding: 0px 6px;
    font-size: 12px;
    border: 1px solid ${({ theme }) => theme.divider.default};
    border-radius: ${({ theme }) => theme.radius.small};
  }
`

export interface NavSearchProps {
  mobile?: boolean
}

export function NavSearch(props: NavSearchProps) {
  const { mobile } = props
  return (
    <NavSearchContainer className="navSearch">
      <svg width="16" height="16" className="icon" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
          stroke="currentColor"
          fill="none"
          fillRule="evenodd"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!mobile && <span className="placeholder">搜索文档</span>}
      {!mobile && <span className="pointKeys">⌘ K</span>}
    </NavSearchContainer>
  )
}
