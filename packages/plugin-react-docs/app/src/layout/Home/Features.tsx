import styled from "@emotion/styled"

const FeaturesContainer = styled.div`
  margin: 40px auto 0 auto;
  max-width: 1200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .item {
    margin-top: 2rem;
    width: 24%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    background-color: #f6f6f7;
    border-radius: 12px;
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    width: 48px;
    height: 48px;
    background-color: #8e96aa23;
    border-radius: 8px;
  }

  .title {
    padding-top: 8px;
    font-weight: 600;
    text-align: justify;
  }

  .detail {
    flex: 1;
    padding-top: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #3c3c43c6;
  }

  @media (max-width: 1024px) {
    padding: 0 48px;

    .item {
      width: 30%;
    }
  }

  @media (max-width: 820px) {
    .item {
      width: 48%;
    }
  }

  @media (max-width: 768px) {
    margin-top: 0px;
    
    .item {
      width: 100%;
      align-items: center;
    }
  }
`

export function Features() {
  return (
    <FeaturesContainer className="features">
      <div className="item">
        <div className="icon">🚀</div>
        <h2 className="title">专注内容</h2>
        <p className="detail">只需 Markdown 即可轻松创建美观的文档站点。</p>
      </div>
      <div className="item">
        <div className="icon">🚀</div>
        <h2 className="title">专注内容</h2>
        <p className="detail">只需 Markdown 即可轻松创建美观的文档站点。</p>
      </div>
      <div className="item">
        <div className="icon">🚀</div>
        <h2 className="title">专注内容</h2>
        <p className="detail">只需 Markdown 即可轻松创建美观的文档站点。</p>
      </div>
      <div className="item">
        <div className="icon">🚀</div>
        <h2 className="title">专注内容</h2>
        <p className="detail">只需 Markdown 即可轻松创建美观的文档站点。</p>
      </div>
    </FeaturesContainer>
  )
}
