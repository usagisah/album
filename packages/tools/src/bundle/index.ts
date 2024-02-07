import { readFile } from "fs/promises"
import prettyBytes, { Options } from "pretty-bytes"
import { CompressCallback, InputType, ZlibOptions, gzip } from "zlib"
import { isNumber, isString } from "../check/simple.js"

export type { Options } from "pretty-bytes"
export async function resolveFileSize(filePath: string, o?: Options): Promise<string>
export async function resolveFileSize(size: number, o?: Options): Promise<string>
export async function resolveFileSize(p: any, o?: Options) {
  let size = p
  if (isString(p)) {
    size = (await readFile(p, "utf-8")).length
  }
  return prettyBytes(size, o)
}

export async function resolveGzipSize(file: InputType, o?: ZlibOptions): Promise<string>
export async function resolveGzipSize(size: number, o?: ZlibOptions): Promise<string>
export async function resolveGzipSize(p: any, o?: ZlibOptions) {
  const calc = (size: number) => {
    return (size / 1024).toFixed(2)
  }
  return new Promise((success, fail) => {
    if (!isNumber(p)) {
      const fn: CompressCallback = (err, res) => {
        if (err) return fail(err)
        success(calc(res.byteLength))
      }
      return o ? gzip(p, o, fn) : gzip(p, fn)
    }
    return success(calc(p))
  })
}
