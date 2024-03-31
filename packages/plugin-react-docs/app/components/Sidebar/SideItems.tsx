import { usePage } from "album.docs"

export function SideItems(props: { items: any[]; indent?: number }) {
  const { items, indent = 0 } = props
  const { location } = usePage()
  return (
    <div className="group">
      {items.map((item, index) => (
        <div className={"item " + (indent === 0 ? "top-group" : "")} key={index+ item.label}>
          <h2 className={"title " + (indent === 0 ? "top-title" : "")}>
            <a href={item.link} className={"text " + (location.pathname === item.link ? "active" : "")}>
              {item.label}
            </a>
            <div className="icon" dangerouslySetInnerHTML={{ __html: item.icon ?? "" }}></div>
          </h2>
          {item.children && <SideItems items={item.children} indent={indent + 1} />}
        </div>
      ))}
    </div>
  )
}
