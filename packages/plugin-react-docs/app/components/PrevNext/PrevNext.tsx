import styled from "@emotion/styled"

const PrevNextContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.divider.default};;

  .page {
    display: block;
    padding: 12px;
    min-width: 48%;
    border: 1px solid ${({ theme }) => theme.divider.default};;
    border-radius: ${({theme}) => theme.radius.default};
    font-weight: 600;
    overflow: hidden;

    &:last-child {
      text-align: right;
    }
  }

  .desc {
    font-size: 12px;
    color:${({ theme }) => theme.text[2]};
  }

  .title {
    font-size: 14px;
    color: ${({ theme }) => theme.primary.default};
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
