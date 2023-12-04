export type Func<P extends any[] = any[], R = any> = (...params: P) => R
export type Obj<T = any> = Record<string | number | symbol, T>
