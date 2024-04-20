import { Global, Theme, css } from "@emotion/react"

export const LIGHT: Theme = {
  white: "#fff",
  default: "#fff",
  reverse: "#000",
  bg: {
    default: "#f8f9fb",
    content: "#f8f9fb",
    highlight: "#eeeff0"
  },
  text: {
    1: "#3c3c43", // rgb(60, 60, 67)
    2: "#3c3c43c7", // rgba(60, 60, 67, 0.78)
    3: "#3c3c438f" // rgba(60, 60, 67, 0.56)
  },
  border: {
    default: "#c2c2c4"
  },
  divider: {
    default: "#e2e2e3"
  },
  gray: {
    1: "#dddde3",
    2: "#e4e4e9",
    3: "#ebebef",
    block: "#f6f6f7"
  },
  primary: {
    default: "#1677ff",
    hover: "#1677ffcc",
    bg: "#409eff"
  },
  info: {
    color: "#3c3c43",
    bg: "#8e96aa23"
  },
  tip: {
    color: "#303032",
    bg: "#646cff23"
  },
  warn: {
    color: "#3c3c43",
    bg: "#eab30824"
  },
  danger: {
    color: "#3c3c43",
    bg: "#f43f5e24"
  },
  radius: {
    small: "4px",
    default: "8px",
    large: "12px",
    btn: "20px",
    max: "%50"
  }
}
export const DARK: Theme = {
  white: "#fff",
  default: "#000",
  bg: {
    default: "#1b1b1f",
    content: "transparent",
    highlight: "#65758528"
  },
  reverse: "#fff",
  text: {
    1: "#fffff5db", // rgba(255, 255, 245, .86)
    2: "#ebebf599", // rgba(235, 235, 245, .6)
    3: "#ebebf560" // rgba(235, 235, 245, .38)
  },
  border: {
    default: "#3c3f44"
  },
  divider: {
    default: "#2e2e32"
  },
  gray: {
    1: "#515c67",
    2: "#414853",
    3: "#32363f",
    block: "transparent"
  },
  primary: {
    default: "#1677ff",
    hover: "#1677ffcc",
    bg: "#409eff"
  },
  info: {
    color: "#fffff5db",
    bg: "#65758528"
  },
  tip: {
    color: "#fffff5db",
    bg: "#646cff28"
  },
  warn: {
    color: "#fffff5db",
    bg: "#eab30828"
  },
  danger: {
    color: "#fffff5db",
    bg: "#f43f5e28"
  },
  radius: {
    small: "4px",
    default: "8px",
    large: "12px",
    btn: "20px",
    max: "%50"
  }
}

export function GlobalStyle({ theme }: { theme: Theme }) {
  return (
    <Global
      styles={css`
        /* -------------- normalize.css -------------- */
        @font-face {
          font-family: Emoji;
          src: local("Apple Color Emojiji"), local("Segoe UI Emoji"), local("Segoe UI Symbol"), local("Noto Color Emoji");
          unicode-range: U+1F000-1F644, U+203C-3299;
        }

        *,
        ::before,
        ::after {
          box-sizing: border-box;
          /* 1 */
          border-width: 0;
          /* 2 */
          border-style: solid;
          /* 2 */
          border-color: currentColor;
          /* 2 */
        }

        html {
          line-height: 1.5;
          /* 1 */
          -webkit-text-size-adjust: 100%;
          /* 2 */
          -moz-tab-size: 4;
          /* 3 */
          tab-size: 4;
          /* 3 */
          font-feature-settings: normal;
          /* 5 */
        }

        body {
          margin: 0;
          /* 1 */
          line-height: inherit;
          /* 2 */
          font-family:
            system-ui,
            —apple-system,
            Segoe UI,
            Rototo,
            Emoji,
            Helvetica,
            Arial,
            sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: ${theme.text[1]};
          background: ${theme.bg.default};
        }

        hr {
          height: 0;
          /* 1 */
          color: inherit;
          /* 2 */
          border-top-width: 1px;
          /* 3 */
        }

        abbr:where([title]) {
          text-decoration: underline dotted;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-size: inherit;
          font-weight: inherit;
        }

        a {
          color: inherit;
          text-decoration: inherit;
        }

        b,
        strong {
          font-weight: bolder;
        }

        code,
        kbd,
        samp,
        pre {
          font-size: 1em;
          /* 2 */
        }

        small {
          font-size: 80%;
        }

        sub,
        sup {
          font-size: 75%;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
        }

        sub {
          bottom: -0.25em;
        }

        sup {
          top: -0.5em;
        }

        table {
          text-indent: 0;
          /* 1 */
          border-color: inherit;
          /* 2 */
          border-collapse: collapse;
          /* 3 */
        }

        button,
        input,
        optgroup,
        select,
        textarea {
          font-family: inherit;
          /* 1 */
          font-size: 100%;
          /* 1 */
          font-weight: inherit;
          /* 1 */
          line-height: inherit;
          /* 1 */
          color: inherit;
          /* 1 */
          margin: 0;
          /* 2 */
          padding: 0;
          /* 3 */
        }

        button,
        select {
          text-transform: none;
        }

        button,
        [type="button"],
        [type="reset"],
        [type="submit"] {
          -webkit-appearance: button;
          /* 1 */
          background-color: transparent;
          /* 2 */
          background-image: none;
          /* 2 */
        }

        :-moz-focusring {
          outline: auto;
        }

        :-moz-ui-invalid {
          box-shadow: none;
        }

        progress {
          vertical-align: baseline;
        }

        ::-webkit-inner-spin-button,
        ::-webkit-outer-spin-button {
          height: auto;
        }

        [type="search"] {
          -webkit-appearance: textfield;
          /* 1 */
          outline-offset: -2px;
          /* 2 */
        }

        ::-webkit-search-decoration {
          -webkit-appearance: none;
        }

        ::-webkit-file-upload-button {
          -webkit-appearance: button;
          /* 1 */
          font: inherit;
          /* 2 */
        }

        summary {
          display: list-item;
        }

        blockquote,
        dl,
        dd,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        hr,
        figure,
        p,
        pre {
          margin: 0;
        }

        fieldset {
          margin: 0;
          padding: 0;
        }

        legend {
          padding: 0;
        }

        ol,
        ul,
        menu {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        textarea {
          resize: vertical;
        }

        input::placeholder,
        textarea::placeholder {
          opacity: 1;
          /* 1 */
          color: #9ca3af;
          /* 2 */
        }

        button,
        [role="button"] {
          cursor: pointer;
        }

        :disabled {
          cursor: default;
        }

        img,
        svg,
        video,
        canvas,
        audio,
        iframe,
        embed,
        object {
          display: block;
          /* 1 */
          vertical-align: middle;
          /* 2 */
        }

        img,
        video {
          max-width: 100%;
          height: auto;
        }

        [hidden] {
          display: none;
        }

        /* -------------- shiki -------------- */
        @media (prefers-color-scheme: dark) {
          .shiki,
          .shiki span {
            color: var(--shiki-dark) !important;
            background-color: var(--shiki-dark-bg);
            font-style: var(--shiki-dark-font-style) !important;
            font-weight: var(--shiki-dark-font-weight) !important;
            text-decoration: var(--shiki-dark-text-decoration) !important;
          }
        }

        html.dark .shiki,
        html.dark .shiki span {
          color: var(--shiki-dark) !important;
          background-color: var(--shiki-dark-bg);
          font-style: var(--shiki-dark-font-style) !important;
          font-weight: var(--shiki-dark-font-weight) !important;
          text-decoration: var(--shiki-dark-text-decoration) !important;
        }

        /* -------------- docs.css -------------- */
        .u-container {
          position: relative;
          line-height: 1.8;

          width: 800px;
          margin: 0 auto;
          padding: 4px;
        }

        .u-article-title {
          font-size: 1.6rem;
          font-weight: 700;
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgb(0 0 0 / 0.1);
        }

        .u-article-title .u-line {
          margin: 0;
        }

        .u-article-profile {
          font-size: 16px;
          line-height: 1.8;
        }

        .u-article-content {
          line-height: 1.8;
          font-size: 16px;
        }

        /* -------------- block -------------- */
        .u-block {
          margin: 1rem 0;
          padding: 1rem;
          border: 1px solid transparent;
          border-radius: ${theme.radius.large};
        }

        .u-block-plain {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .u-block-title {
          margin: 0;
          padding: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .u-block-msg {
          margin: 0;
          padding: 0;
          font-size: 14px;
        }

        .u-block-info {
          color: ${theme.info.color};
          background-color: ${theme.info.bg};
        }

        .u-block-tip {
          color: ${theme.tip.color};
          background-color: ${theme.tip.bg};
        }

        .u-block-warn {
          color: ${theme.warn.color};
          background-color: ${theme.warn.bg};
        }

        .u-block-danger {
          color: ${theme.danger.color};
          background-color: ${theme.danger.bg};
        }

        .u-block-details {
          color: ${theme.info.color};
          background-color: ${theme.info.bg};
        }

        /* -------------- code -------------- */
        .u-code {
          position: relative;
          display: inline-block;
          width: 100%;
          margin: 1rem 0;
          padding: 0.5rem;
          max-width: 100%;
          overflow-x: auto;
          background-color: ${theme.default};
          border: 1px solid ${theme.gray.block};
          font-weight: 400;
          white-space: nowrap;
          box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 2px 4px -2px rgb(0 0 0 / 0.1);
          border-radius: ${theme.radius.large};
        }

        .u-code pre {
          margin: 0;
          padding: 0;
        }

        .u-code .line {
          display: block;
          line-height: 1.8;
        }

        .u-code-lang {
          position: absolute;
          right: 0;
          top: 0;
          top: 10px;
          right: 12px;
          z-index: 2;
          font-size: 12px;
          font-weight: 600;
          color: ${theme.text[2]};
        }

        .u-code:hover .u-code-lang {
          opacity: 0;
          z-index: -1;
        }

        .u-code-copy {
          padding: 8px;
          position: absolute;
          top: 4px;
          right: 8px;
          font-size: 16px;
          color: ${theme.reverse};
          font-weight: 800;
          opacity: 0;
          border-radius: ${theme.radius.small};
          cursor: pointer;
        }

        .u-code:hover .u-code-copy {
          opacity: 1;
        }

        .u-code-copy svg {
          width: 16px;
          height: 16px;
          fill: ${theme.reverse};
          cursor: pointer;
        }

        html body .shiki span.u-code-highlighted {
          display: inline-block;
          width: 100%;
          background-color: ${theme.bg.highlight}!important;
          border-radius: ${theme.radius.small};
        }

        .u-code-highlighted * {
          background: transparent !important;
        }

        /* -------------- table -------------- */
        .u-table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
        }

        .u-table th {
          padding: 4px;
          border: 1px solid ${theme.border.default};
          background-color: transparent;
          font-weight: bold;
        }

        .u-table td {
          padding: 4px;
          border: 1px solid ${theme.border.default};
        }

        /* -------------- line -------------- */
        .u-line {
          margin: 1rem 0;
          padding: 0;
          color: ${theme.text[1]};
        }

        .u-br {
          padding: 1rem 0;
        }

        /* -------------- divide -------------- */
        .u-hr {
          margin: 1rem 0 0.5rem 0;
          border: 0.5px solid rgb(235, 236, 240);
        }

        /* -------------- title -------------- */
        .u-h {
          position: relative;
        }

        .u-h .text {
          cursor: default;
        }

        .u-h-anchor {
          position: absolute;
          left: -1.5rem;
          text-decoration: none;
          user-select: none;
          font-weight: 400;
          opacity: 0;
        }

        .u-h-anchor:hover {
          opacity: 1;
          color: ${theme.primary.default};
        }

        .u-h span:hover + .u-h-anchor {
          opacity: 1;
        }

        .u-h1 {
          padding: 0 0 2rem 0;
          font-size: 2rem;
          font-weight: 800;
        }

        .u-h1 .u-h-anchor {
          position: absolute;
          left: -1.5rem;
          top: 0;
        }

        .u-h2 {
          padding: 4rem 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          border-top: 1px solid #e2e2e3;
        }

        .u-h3 {
          padding: 2px 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .u-h4 {
          font-size: 1rem;
          font-weight: 500;
        }

        /* -------------- list -------------- */
        .u-list {
          margin: 1rem 0 1rem 0;
          color: ${theme.text[1]};
        }

        .u-list .u-list {
          margin: 0;
        }

        .u-list li + li {
          margin-top: 4px;
        }

        .u-ol {
          list-style: decimal;
          padding-left: 1.25rem;
        }

        .u-ul {
          list-style: circle;
          padding-left: 1.25rem;
        }

        /* --------------  -------------- */
        .u-blockquote {
          margin: 1rem;
          padding: 1rem 0rem 1rem 1rem;
          background-color: rgba(142, 150, 170, 0.14);
          border-left: 4px solid #ccc;
          font-weight: 500;
          border-radius: 0 ${theme.radius.default} ${theme.radius.default} 0;
        }

        .u-blockquote .u-blockquote {
          margin: 0;
        }

        /* --------------  -------------- */
        .u-strong {
          margin: 0 4px;
          font-weight: 600;
          font-size: 1.15rem;
        }

        .u-a {
          color: ${theme.primary.default};
          font-weight: 500;
          margin: 0 4px;
          padding: 0 2px;
          transition:
            color 0.25s,
            opacity 0.25s;
          text-decoration: underline;
          text-underline-offset: 2px;
          font-size: 1rem;
        }

        .u-line-code {
          display: inline-flex;
          margin: 0 4px;
          padding: 2px 4px;
          color: ${theme.primary.default};
          background-color: ${theme.bg.highlight};
          font-weight: 400;
          border-radius: ${theme.radius.small};
          transition:
            0.25s,
            background-color 0.5s;
        }

        .u-img {
          margin: 1rem auto;
          padding: 2px;
          width: 95%;
          border-radius: ${theme.radius.default};
          border: 1px solid #e5e7eb;
        }

        .u-img.error {
          margin: 1rem 0;
          padding: 0;
          width: 100%;
          height: 40px;
        }
      `}
    />
  )
}
