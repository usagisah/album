import styled from "@emotion/styled"

const SideItemsContainer = styled.div`
  width: 100%;

  .group {
    padding-left: 1rem;
  }

  .title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    color: #3c3c43c6;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .text {
      display: block;
      flex: 1;
    }
  }

  .top-group {
    padding-bottom: 1rem;
  }
  .top-title {
    font-weight: 800;
    color: #3c3c43;
  }

  .indicator {
    position: absolute;
    top: 0px;
    bottom: -2px;
    left: -16px;
    width: 1px;
    background: rgba(226, 226, 227, 0.8);
    border-radius: 4px;
  }
`

export function SideItems(props: { items: any[]; indent?: number }) {
  const { items, indent = 0 } = props
  return (
    <SideItemsContainer className="group">
      {items.map(item => (
        <div className={"item " + (indent === 0 ? "top-group" : "")} key={item.link + item.label}>
          <h2 className={"title " + (indent === 0 ? "top-title" : "")}>
            {indent > 0 && <div className="indicator"></div>}
            <a href={item.link} className="text">
              {item.label}
            </a>
            <div className="icon" dangerouslySetInnerHTML={{ __html: item.icon ?? "" }}></div>
          </h2>
          {item.children && <SideItems items={item.children} indent={indent + 1} />}
        </div>
      ))}
    </SideItemsContainer>
  )
}
