import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { SideItems } from "./SideItems"

const SidebarContainer = styled.ul`
  position: sticky;
  top: 100px;
  width: 240px;
  max-height: calc(100vh - 76px);
  overflow: auto;
`
export function Sidebar() {
  const { sidebar } = usePage()
  return (
    <SidebarContainer className="sidebar">
      <SideItems items={sidebar} indent={0} />
    </SidebarContainer>
  )
}
