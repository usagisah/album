/* 
  引用自 npm:murmurhash
*/

const createBuffer = (val: string | Uint8Array) => new TextEncoder().encode(val as any)

const default_seed = Date.now()

export function hash2(str: string | Uint8Array, seed = default_seed) {
  if (typeof str === "string") str = createBuffer(str)
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k

  while (l >= 4) {
    k = (str[i] & 0xff) | ((str[++i] & 0xff) << 8) | ((str[++i] & 0xff) << 16) | ((str[++i] & 0xff) << 24)

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)
    k ^= k >>> 24
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)

    h = ((h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k

    l -= 4
    ++i
  }

  switch (l) {
    case 3:
      h ^= (str[i + 2] & 0xff) << 16
    case 2:
      h ^= (str[i + 1] & 0xff) << 8
    case 1:
      h ^= str[i] & 0xff
      h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  }

  h ^= h >>> 13
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  h ^= h >>> 15

  return h >>> 0
}

export function hash3(key: string | Uint8Array, seed = default_seed) {
  if (typeof key === "string") key = createBuffer(key)

  let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i

  remainder = key.length & 3 // key.length % 4
  bytes = key.length - remainder
  h1 = seed
  c1 = 0xcc9e2d51
  c2 = 0x1b873593
  i = 0

  while (i < bytes) {
    k1 = (key[i] & 0xff) | ((key[++i] & 0xff) << 8) | ((key[++i] & 0xff) << 16) | ((key[++i] & 0xff) << 24)
    ++i

    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16)
  }

  k1 = 0

  switch (remainder) {
    case 3:
      k1 ^= (key[i + 2] & 0xff) << 16
    case 2:
      k1 ^= (key[i + 1] & 0xff) << 8
    case 1:
      k1 ^= key[i] & 0xff

      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
  }

  h1 ^= key.length

  h1 ^= h1 >>> 16
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 16

  return h1 >>> 0
}
