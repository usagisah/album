import { css, useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { usePage } from "album.docs"

const MainHomeContainer = styled.main`
  flex: 1;
  margin-top: 64px;
  margin-bottom: 120px;

  .bgImg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }

  .wrapper {
    padding: 64px 0 0 0;
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    max-width: 1100px;
  }

  .hero {
    max-width: 600px;

    .title {
      font-size: 56px;
      font-weight: 600;
      background: ${({ theme }) => `-webkit-linear-gradient(120deg, ${theme.primary.default} 30%, slateblue)`};
      background-clip: text;
      color: transparent;
      text-align: justify;
      -webkit-text-fill-color: transparent;
    }

    .description {
      font-weight: 700;
      padding-top: 12px;
      font-size: 56px;
      text-align: justify;
    }

    .tagline {
      padding-top: 12px;
      font-size: 24px;
      color: ${({ theme }) => theme.text[2]};
      text-align: justify;
    }

    .fastActions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 32px;
    }
  }

  .image {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate(-32px, -32px);

    .bg {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: -1;
      width: 320px;
      height: 320px;
      border-radius: ${({ theme }) => theme.radius.max};
      transform: translate(-50%, -50%);
      background-color: rgba(68, 153, 205, 0.4);
      filter: blur(68px);
    }

    img {
      display: block;
      width: 320px;
      height: 320px;
    }
  }

  @media (max-width: 1024px) {
    .wrapper {
      flex-direction: column;
      align-items: center;
      padding-left: 48px;
      padding-right: 48px;
    }

    .hero {
      transform: translateY(86%);

      .title,
      .description,
      .tagline {
        text-align: center;
      }

      .fastActions {
        justify-content: center;
      }
    }

    .image {
      transform: translateY(-120%);
    }
  }

  @media (max-width: 768px) {
    .hero {
      transform: translateY(65%);
    }
    .image {
      transform: translateY(-150%);
    }
  }

  @media (max-width: 575px) {
    .hero {
      transform: translateY(30%);
    }

    .image {
      transform: translateY(-270%);

      .bg {
        width: 270px;
        height: 270px;
      }

      img {
        width: 270px;
        height: 270px;
      }
    }
  }
`

export function MainHome() {
  const { frontmatter, components, logo } = usePage()
  const Features = components["Features"]
  const Content = components["Content"]
  return (
    <MainHomeContainer className="mainHome">
      <img className="bgImg" src="/home.bg.png" alt="" />
      <div className="wrapper">
        <div className="hero">
          {frontmatter.title && <p className="title" dangerouslySetInnerHTML={{ __html: frontmatter.title }}></p>}
          {frontmatter.description && <p className="description" dangerouslySetInnerHTML={{ __html: frontmatter.description }}></p>}
          {frontmatter.tagline && <p className="tagline" dangerouslySetInnerHTML={{ __html: frontmatter.tagline }}></p>}
          {Array.isArray(frontmatter.actions) && (
            <div className="fastActions">
              {frontmatter.actions.map((item, index) => (
                <CircleButton item={item} index={index} key={index}></CircleButton>
              ))}
            </div>
          )}
        </div>
        <div className="image">
          <div className="bg"></div>
          {logo.href && <img src={logo.href} alt="" />}
        </div>
      </div>
      <Features />
      <Content />
    </MainHomeContainer>
  )
}

function CircleButton({ index, item }: { index: number; item: { text: string; link: string } }) {
  const theme = useTheme()
  const primary = index === 0
  return (
    <a
      href={item.link}
      css={css`
        display: inline-flex;
        padding: 10px 20px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        color: ${primary ? theme.white : theme.text[1]};
        background-color: ${primary ? theme.primary.bg : theme.gray[3]};
        border-radius: ${theme.radius.btn};
        &:hover {
          color: ${primary ? theme.default : theme.text[1]};
          background-color: ${primary ? theme.primary.hover : theme.gray[2]};
        }
      `}
    >
      <button>{item.text}</button>
    </a>
  )
}
