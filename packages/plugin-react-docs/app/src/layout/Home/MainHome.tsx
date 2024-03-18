import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ReactNode } from "react"
import bg from "../../assets/home.bg.png"
import { Features } from "./Features"

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
    z-index: -1;
  }

  .wrapper {
    padding: 64px 0 0 0;
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    max-width: 1050px;
  }

  .hero {
    max-width: 600px;

    .title {
      font-size: 56px;
      font-weight: 600;
      background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
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
      color: #3c3c43c6;
      text-align: justify;
    }

    .fastActions {
      display: flex;
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
      border-radius: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(-45deg, #00bfff 50%, #f2f1ef 50%);
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
      transform: translateY(60%);
    }
    .image {
      transform: translateY(-150%);
    }
  }
`

export function MainHome() {
  return (
    <MainHomeContainer className="mainHome">
      <img className="bgImg" src={bg} alt="" />
      <div className="wrapper">
        <div className="hero">
          <p className="title">VitePress</p>
          <p className="description">由 Vite 和 Vue 驱动的静态站点生成器</p>
          <p className="tagline">将 Markdown 变成优雅的文档，只需几分钟</p>
          <div className="fastActions">
            <CircleButton primary>什么是 VitePress</CircleButton>
            <CircleButton>快速开始</CircleButton>
            <CircleButton>Github</CircleButton>
          </div>
        </div>
        <div className="image">
          <div className="bg"></div>
          <img src="https://vitepress.dev/vitepress-logo-large.webp" alt="" />
        </div>
      </div>

      <Features />
    </MainHomeContainer>
  )
}

function CircleButton({ primary, href, children }: { primary?: boolean; href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      css={css`
        display: inline-flex;
        padding: 10px 20px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        color: ${primary ? "white" : "#3c3c43"};
        background-color: ${primary ? "#5672cd" : "#ebebef"};
        border-radius: 20px;
      `}
    >
      <button>{children}</button>
    </a>
  )
}
