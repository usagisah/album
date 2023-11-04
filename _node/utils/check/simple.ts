import { Fun } from "../types/types.js"

export function isPlainObject<T extends Record<string, any> = Record<string, any>>(value: unknown): value is T {
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
export function isFunction<T extends Fun>(value: unknown): value is T {
  return typeof value === "function"
}
export function isSymbol(value: unknown): value is symbol {
  return typeof value === "symbol"
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined"
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isRegExp(value: unknown): value is RegExp {
  return Object.prototype.toString.call(value) === "[object RegExp]"
}

export function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === "[object Date]"
}

export function isError(value: unknown): value is Error {
  return Object.prototype.toString.call(value) === "[object Error]"
}

export function isStrictEmpty(value: unknown) {
  return value === null || value === undefined || (isString(value) && value.trim() === "") || (isArray(value) && value.length === 0)
}

export function isEmpty(value: unknown) {
  return value === null || value === undefined
}

export function isMap<T extends Map<any, any> = Map<any, any>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === "[object Map]"
}

export function isSet<T extends Set<any> = Set<any>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === "[object Set]"
}

export function isWeakMap<T extends WeakMap<any, any> = WeakMap<any, any>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === "[object WeakMap]"
}

export function isWeakSet<T extends WeakSet<any> = WeakSet<any>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === "[object WeakSet]"
}
