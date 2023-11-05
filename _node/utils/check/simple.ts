import { Fun } from "../types/types.js"

const s = Object.prototype.toString

export function isPlainObject<T extends Record<string, any> = Record<string, any>>(value: unknown): value is T {
  return s.call(value) === "[object Object]"
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
  return s.call(value) === "[object RegExp]"
}

export function isDate(value: unknown): value is Date {
  return s.call(value) === "[object Date]"
}

export function isError(value: unknown): value is Error {
  return s.call(value) === "[object Error]"
}

export function isStrictEmpty(value: unknown) {
  return value === null || value === undefined || (isString(value) && value.trim() === "") || (isArray(value) && value.length === 0)
}

export function isEmpty(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function isMap<K = any, V = any>(value: unknown): value is Map<K, V> {
  return s.call(value) === "[object Map]"
}

export function isSet<T = any>(value: unknown): value is Set<T> {
  return s.call(value) === "[object Set]"
}

export function isWeakMap<T extends object = Record<string, any>, V = any>(value: unknown): value is WeakMap<T, V> {
  return s.call(value) === "[object WeakMap]"
}

export function isWeakSet<T extends object = Record<string, any>>(value: unknown): value is WeakSet<T> {
  return s.call(value) === "[object WeakSet]"
}

export function isSameType(v1: unknown, v2: unknown) {
  return s.call(v1) === s.call(v2)
}
