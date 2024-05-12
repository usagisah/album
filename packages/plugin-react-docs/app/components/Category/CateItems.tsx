import { Category, usePage } from "album.docs"

export function CateItems(props: { items: Category[]; indent?: number }) {
  const { items, indent = 0 } = props
  const { location } = usePage()
  return (
    <div className="group">
      {items.map((item, index) => (
        <div className="item" key={index + item.label}>
          <h2 className="title">
            <a href={item.link} title={item.label} className={"text " + (location.hash === item.label ? "active" : "")}>
              {item.label}
            </a>
          </h2>
          {item.children && <CateItems items={item.children} indent={indent + 1} />}
        </div>
      ))}
    </div>
  )
}
