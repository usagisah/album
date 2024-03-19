import styled from "@emotion/styled"

const CategoryContainer = styled.aside`
  width: 240px;
  position: sticky;
  top: 106px;
  max-height: 80vh;
  color: #3c3c43c6;
  overflow: auto;

  .title {
    font-size: 16px;
    font-weight: 600;
  }

  .topic {
    padding: 4px 8px;
    border-left: 1px solid #e2e2e3;
  }

  .link {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export function Category() {
  return (
    <CategoryContainer className="category">
      <h4 className="title">页面导航</h4>
      <div className="topic">
        <a className="link" href="">
          重点配置项
        </a>
      </div>
    </CategoryContainer>
  )
}
