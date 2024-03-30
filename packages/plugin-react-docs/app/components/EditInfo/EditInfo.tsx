import styled from "@emotion/styled"

const EditInfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-bottom: 14px;
  font-weight: 500;
  font-size: 14px;

  .edit-link {
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
    color: ${({ theme }) => theme.primary.default};
    fill: ${({ theme }) => theme.primary.default};
    transition: all 0.25s;

    &:hover {
      color: ${({ theme }) => theme.primary.hover};
      border: 1px solid ${({ theme }) => theme.primary.hover};
      fill: ${({ theme }) => theme.primary.hover};
    }
  }

  .last-updated {
    color: ${({ theme }) => theme.text[2]};
  }
`

export function EditInfo() {
  return (
    <EditInfoContainer className="edit-info">
      <a href="" className="edit-link">
        <svg viewBox="0 0 1061 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4213" width="14" height="14">
          <path
            d="M877.714 475.429v402.286c0 40.396-32.747 73.143-73.143 73.143H146.285c-40.396 0-73.143-32.747-73.143-73.143V219.429c0-40.396 32.747-73.143 73.143-73.143h438.857V73.143H146.285C65.494 73.143-0.001 138.637-0.001 219.429v658.286c0 80.791 65.494 146.286 146.286 146.286h658.286c80.791 0 146.286-65.494 146.286-146.286V475.429h-73.143z"
            p-id="4214"
          ></path>
          <path
            d="M397.897 774.217c-5.145 0.812-11.079 1.275-17.121 1.275-27.052 0-51.934-9.295-71.624-24.866-24.26-24.318-23.529-59.427-22.798-117.209 2.851-45.25 21.396-85.691 50.197-116.398L830.903 22.674c40.96-40.96 100.206-20.48 138.24 16.091 10.971 10.971 40.594 40.96 51.566 51.566 36.571 36.571 58.88 96.914 17.189 138.971L543.087 724.113c-30.205 29.593-71.086 48.391-116.341 50.093l-28.848 0.01z m-36.571-75.337c13.39 1.737 28.876 2.729 44.595 2.729 6.955 0 13.864-0.194 20.723-0.577 24.676-1.644 47.559-12.193 64.931-28.534l495.854-494.76c0.004-0.236 0.007-0.514 0.007-0.793 0-14.36-6.517-27.198-16.754-35.717-11.047-10.667-41.401-41.021-52.007-51.992-8.83-10.109-21.744-16.459-36.141-16.459l-0.454 0.002-494.423 494.446a115.687 115.687 0 0 0-28.495 66.486c-0.399 6.509-0.609 13.605-0.609 20.75 0 15.659 1.007 31.082 2.961 46.209z"
            p-id="4215"
          ></path>
        </svg>
        <span>在 Github 上编辑此页面</span>
      </a>
      <div className="last-updated">
        <span>最后更新于: 2024/1/27 14:02:14</span>
      </div>
    </EditInfoContainer>
  )
}
