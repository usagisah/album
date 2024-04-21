import styled from "@emotion/styled"
import { LinkItem, usePage } from "album.docs"
import { useMemo } from "react"

const PrevNextContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.divider.default};

  .page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 12px;
    min-width: 48%;
    height: 65px;
    border: 1px solid ${({ theme }) => theme.divider.default};
    border-radius: ${({ theme }) => theme.radius.default};
    font-weight: 600;
    overflow: hidden;
    cursor: pointer;

    &:hover {
      border: 1px solid ${({ theme }) => theme.primary.default};
    }

    &.prev {
      align-items: flex-start;
    }

    &.next {
      align-items: flex-end;
    }
  }

  .desc {
    font-size: 12px;
    color: ${({ theme }) => theme.text[2]};
  }

  .title {
    font-size: 14px;
    color: ${({ theme }) => theme.primary.default};
  }
`

export function PrevNext() {
  const { location, sidebar } = usePage()
  const info = useMemo(() => {
    const res = { prev: null as LinkItem | null, next: null as LinkItem | null }
    const linkItems: LinkItem[] = []
    function nextItems(items: LinkItem[]) {
      for (const item of items) {
        linkItems.push(item)
        if (item.children && item.children.length > 0) {
          nextItems(item.children)
        }
      }
    }

    nextItems(sidebar)
    const index = linkItems.findIndex(v => v.link === location.pathname)
    if (index > -1) {
      if (index - 1 > -1) {
        res.prev = linkItems[index - 1]
      }
      if (index + 1 < linkItems.length) {
        res.next = linkItems[index + 1]
      }
    }

    return res
  }, [])
  return (
    <PrevNextContainer className="prev-next">
      {info.prev ? (
        <a href={info.prev.link} className="page prev">
          <p className="desc">上一页</p>
          <p className="title">{info.prev.label}</p>
        </a>
      ) : (
        <div className="page prev" style={{ borderColor: "transparent", cursor: "none" }}></div>
      )}

      {info.next ? (
        <a href={info.next.link} className="page next">
          <p className="desc">下一页</p>
          <p className="title">{info.next.label}</p>
        </a>
      ) : (
        <div className="page next" style={{ borderColor: "transparent", cursor: "none" }}></div>
      )}
    </PrevNextContainer>
  )
}
