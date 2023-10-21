export function isPlainObject<T extends Record<string, any>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === "[object Object]"
}
export function isString(value: unknown): value is string {
  return typeof value === "string"
}
export function isNumber(value: unknown): value is number {
  return typeof value === "number"
}
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}
export function isArray<T extends any[] = any>(value: unknown): value is T[] {
  return Array.isArray(value)
}
export function isFunction<T = any>(value: unknown): value is T {
  return typeof value === "function"
}
