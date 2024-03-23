import styled from "@emotion/styled"

const PrevNextContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 24px;
  border-top: 1px solid #e2e2e3;

  .page {
    display: block;
    padding: 12px;
    min-width: 48%;
    border: 1px solid #e2e2e3;
    border-radius: 8px;
    font-weight: 600;
    overflow: hidden;

    &:last-child {
      text-align: right;
    }
  }

  .desc {
    font-size: 12px;
    color: #3c3c43c6;
  }

  .title {
    font-size: 14px;
    color: #3451b2;
  }
`

export function PrevNext() {
  return (
    <PrevNextContainer className="prev-next">
      <a href="" className="page prev">
        <p className="desc">上一页</p>
        <p className="title">部署</p>
      </a>

      <a href="" className="page next">
        <p className="desc">下一页</p>
        <p className="title">资源处理</p>
      </a>
    </PrevNextContainer>
  )
}
