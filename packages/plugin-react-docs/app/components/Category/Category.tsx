import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { CateItems } from "./CateItems"

const CategoryContainer = styled.aside`
  width: 220px;
  position: sticky;
  top: 120px;
  max-height: 80vh;
  color: ${({ theme }) => theme.text[2]};
  overflow: auto;

  .cat-title {
    font-size: 14px;
    font-weight: 600;
    padding-bottom: 0.5rem;
  }

  .topic {
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
`

export function Category() {
  const { category } = usePage()
  return (
    <CategoryContainer className="category">
      <h4 className="cat-title">页面导航</h4>
      <div className="topic">
        <CateItems items={category} />
      </div>
    </CategoryContainer>
  )
}
