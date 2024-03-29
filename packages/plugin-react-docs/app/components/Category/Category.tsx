import styled from "@emotion/styled"
import { SideItems } from "../Sidebar/SideItems"

const CategoryContainer = styled.aside`
  width: 240px;
  position: sticky;
  top: 106px;
  max-height: 80vh;
  color: ${({ theme }) => theme.text[2]};
  overflow: auto;

  .cat-title {
    font-weight: 600;
    font-size: 14px;
    padding-bottom: 0.5rem;
  }

  .topic {
    color: ${({ theme }) => theme.text[2]};
    padding: 0px 0px 0 1rem;
    border-left: 1px solid ${({ theme }) => theme.divider.default};

    .top-group {
      padding-bottom: 0px;
    }

    .top-title {
      color: ${({ theme }) => theme.text[2]};
    }

    .title {
      font-weight: 400;
      font-size: 14px;
    }

    .indicator {
      display: none;
    }
  }
`

export function Category() {
  return (
    <CategoryContainer className="category">
      <h4 className="cat-title">页面导航</h4>
      <div className="topic">
        <SideItems
          items={[
            { label: "基于文件的路由", link: "a" },
            {
              label: "基于文件的路由",
              link: "b",
              children: [
                { label: "根目录", link: "aaa" },
                { label: "原目录", link: "ab" }
              ]
            }
          ]}
        />
      </div>
    </CategoryContainer>
  )
}
