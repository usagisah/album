import styled from "@emotion/styled"
import { usePage } from "album.docs"

export function Features() {
  const { features } = usePage().frontmatter
  if (!Array.isArray(features)) {
    return null
  }

  return (
    <FeaturesContainer className="features">
      {features.map((item, index) => (
        <div className="item" key={index}>
          {item.icon && <div className="icon" dangerouslySetInnerHTML={{ __html: item.icon }}></div>}
          {item.title && <h2 className="title" dangerouslySetInnerHTML={{ __html: item.title }}></h2>}
          {item.detail && <p className="detail" dangerouslySetInnerHTML={{ __html: item.detail }}></p>}
        </div>
      ))}
    </FeaturesContainer>
  )
}

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
    background-color: ${({ theme }) => theme.white};
    border-radius: ${({ theme }) => theme.radius.large};
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    width: 48px;
    height: 48px;
    background-color: ${({ theme }) => theme.gray[3]};
    border-radius: ${({ theme }) => theme.radius.default};
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
    color: ${({ theme }) => theme.text[2]};
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
