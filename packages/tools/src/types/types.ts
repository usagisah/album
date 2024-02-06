export type Func<P extends any[] = any[], R = any> = (...params: P) => R
export type Obj<T = any> = Record<string | number | symbol, T>

export type InferObj<T extends Obj> = T extends Obj<infer R> ? R : never
