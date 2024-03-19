import styled from "@emotion/styled"
import { usePage } from "album.docs"

const SidebarContainer = styled.ul`
  position: sticky;
  top: 76px;
  padding-top: 20px;
  width: 240px;
  max-height: calc(100vh - 76px);
  overflow: auto;
`
export function Sidebar() {
  const { sidebar } = usePage()
  console.log( sidebar )
  return <SidebarContainer className="sidebar">
    111
  </SidebarContainer>
}
