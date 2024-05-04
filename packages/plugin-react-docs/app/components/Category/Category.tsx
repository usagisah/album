import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { useEffect, useState } from "react"
import { CateItems } from "./CateItems"

const CategoryContainer = styled.aside`
  width: 220px;
  position: sticky;
  top: 120px;
  max-height: 80vh;
  color: ${({ theme }) => theme.text[2]};

  .cat-title {
    font-size: 14px;
    font-weight: 600;
    padding-bottom: 0.5rem;
  }

  .topic {
    position: relative;
    color: ${({ theme }) => theme.text[2]};
    padding: 0px 0px 0 1rem;
    font-size: 14px;
    border-left: 1px solid ${({ theme }) => theme.divider.default};
  }

  .group {
    width: 100%;

    .group {
      padding-left: 16px;
    }

    .title {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      line-height: 32px;
      color: ${({ theme }) => theme.text[2]};
      font-weight: 400;
      cursor: pointer;

      .text {
        display: block;
        flex: 1;
        font-size: 14px;
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
  }

  .mark-line {
    position: absolute;
    left: -1.5px;
    width: 3px;
    height: 18px;
    background-color: ${({ theme }) => theme.primary.default};
    border-radius: ${({ theme }) => theme.radius.small};
    transition: top 0.1s;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`

export function Category() {
  const { category } = usePage()
  const [markTop, setMarkTop] = useState(-1)

  useEffect(() => {
    const baseTop = document.querySelector(".topic")!.getBoundingClientRect().y
    const elemMap = new Map<Element, { show: boolean; cateElem: HTMLElement }>()
    let lastRecord: any
    const observer = new IntersectionObserver(
      (list, observer) => {
        for (const { target, isIntersecting } of list) {
          const res = elemMap.get(target)
          if (!res) {
            return
          }

          res.show = isIntersecting
        }

        for (const { show, cateElem } of elemMap.values()) {
          if (!show) {
            continue
          }

          setMarkTop(cateElem.getBoundingClientRect().y - baseTop)
          return
        }

        const { y } = lastRecord.cateElem.getBoundingClientRect()
        if (window.scrollY + 60 > y) {
          setMarkTop(y - baseTop)
          lastRecord.show = true
        } else {
          setMarkTop(-1)
        }
      },
      { rootMargin: "-60px" }
    )

    setTimeout(() => {
      const titleElems = [...document.querySelectorAll(".article .md .u-h")]
      const cateElems = [...document.querySelectorAll(".topic a")]
      if (cateElems.length === titleElems.length) {
        titleElems.forEach((el, index) => {
          elemMap.set(el, (lastRecord = { show: false, cateElem: cateElems[index] as HTMLElement }))
          observer.observe(el)
        })
      }
    }, 800)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <CategoryContainer className="category">
      <h4 className="cat-title">页面导航</h4>
      <div className="topic">
        <div className="mark-line" style={{ opacity: markTop === -1 ? "0" : "1", top: markTop + 6 + "px" }}></div>
        <CateItems items={category} />
      </div>
    </CategoryContainer>
  )
}
