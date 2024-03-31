import { usePage } from "album.docs"

export function CateItems(props: { items: any[]; indent?: number }) {
  const { items, indent = 0 } = props
  const { location } = usePage()
  return (
    <div className="group">
      {items.map((item, index) => (
        <div className="item" key={index + item.label}>
          <h2 className="title">
            <a href={"#" + item.label} title={item.label} className={"text " + (location.hash === item.label ? "active" : "")}>
              {item.label}
            </a>
            <div className="icon" dangerouslySetInnerHTML={{ __html: item.icon ?? "" }}></div>
          </h2>
          {item.children && <CateItems items={item.children} indent={indent + 1} />}
        </div>
      ))}
    </div>
  )
}
