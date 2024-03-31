import { IconType } from "./icon.type"

export function IconMenuOutlined({ size, color, ...props }: IconType) {
  let width = "1rem"
  let height = "1rem"
  if (typeof size === "string") {
    width = height = size
  } else if (typeof size === "number") {
    width = height = size + "px"
  }
  return (
    <svg {...props} className="icon-MenuOutlined" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4197" width={width} height={height}>
      <path
        d="M128 469.333333m17.066667 0l733.866666 0q17.066667 0 17.066667 17.066667l0 51.2q0 17.066667-17.066667 17.066667l-733.866666 0q-17.066667 0-17.066667-17.066667l0-51.2q0-17.066667 17.066667-17.066667Z"
        fill={color ?? "currentColor"}
        p-id="4198"
      ></path>
      <path
        d="M128 128m17.066667 0l733.866666 0q17.066667 0 17.066667 17.066667l0 51.2q0 17.066667-17.066667 17.066666l-733.866666 0q-17.066667 0-17.066667-17.066666l0-51.2q0-17.066667 17.066667-17.066667Z"
        fill={color ?? "currentColor"}
        p-id="4199"
      ></path>
      <path
        d="M128 810.666667m17.066667 0l733.866666 0q17.066667 0 17.066667 17.066666l0 51.2q0 17.066667-17.066667 17.066667l-733.866666 0q-17.066667 0-17.066667-17.066667l0-51.2q0-17.066667 17.066667-17.066666Z"
        fill={color ?? "currentColor"}
        p-id="4200"
      ></path>
    </svg>
  )
}
