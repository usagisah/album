import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ReactNode } from "react"
import bg from "../../assets/home.bg.png"

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
      -webkit-text-fill-color: transparent;
    }

    .description {
      font-weight: 700;
      padding-top: 12px;
      font-size: 56px;
    }

    .tagline {
      padding-top: 12px;
      font-size: 24px;
      color: #3c3c43c6;
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

  .features {
    margin: 40px auto 0 auto;
    width: 1050px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      margin-top: 2rem;
      width: 320px;
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
            <CircleButton type="primary">什么是 VitePress</CircleButton>
            <CircleButton>快速开始</CircleButton>
            <CircleButton>Github</CircleButton>
          </div>
        </div>
        <div className="image">
          <div className="bg"></div>
          <img src="https://vitepress.dev/vitepress-logo-large.webp" alt="" />
        </div>
      </div>

      <div className="features">
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
      </div>
    </MainHomeContainer>
  )
}

function CircleButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      css={css`
        display: inline-flex;
        padding: 10px 20px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        color: #3c3c43;
        background-color: #ebebef;
        border-radius: 20px;
      `}
    >
      <button>{children}</button>
    </a>
  )
}
