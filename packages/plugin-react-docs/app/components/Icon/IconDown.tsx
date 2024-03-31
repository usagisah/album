import { IconType } from "./icon.type"

export function IconDown({ size, color, ...props }: IconType) {
  let width = "1rem"
  let height = "1rem"
  if (typeof size === "string") {
    width = height = size
  } else if (typeof size === "number") {
    width = height = size + "px"
  }
  return (
    <svg className="icon-down" width={width} height={height} {...props} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4344">
      <path d="M512 785.664L137.472 411.136l60.330667-60.330667 314.453333 313.984 310.912-310.954666 60.330667 60.330666z" fill={color ?? "currentColor"} p-id="4345"></path>
    </svg>
  )
}
