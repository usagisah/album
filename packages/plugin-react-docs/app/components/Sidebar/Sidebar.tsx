import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { SideItems } from "./SideItems"

const SidebarContainer = styled.ul`
  position: sticky;
  top: 100px;
  width: 240px;
  max-height: calc(100vh - 76px);
  overflow: auto;

  .group {
    width: 100%;

    .group {
      padding-left: 16px;
      border-left: 1px solid ${({theme}) => theme.divider.default};
    }

    .title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      line-height: 32px;
      color: ${({ theme }) => theme.text[2]};
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;

      .text {
        display: block;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
          color: ${({ theme }) => theme.primary.hover};
        }
      }

      .active {
        color: ${({ theme }) => theme.primary.default};
      }
    }

    .top-group {
      padding-bottom: 1rem;
    }
    .top-title {
      font-weight: 800;
      color: ${({ theme }) => theme.text[1]};
    }
  }
`
export function Sidebar() {
  const { sidebar } = usePage()
  return (
    <SidebarContainer className="sidebar">
      <SideItems items={sidebar} indent={0} />
    </SidebarContainer>
  )
}
