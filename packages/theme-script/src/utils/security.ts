import { bytes2hex, bytes2str, hex2bytes, str2bytes } from 'x-byte-js'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export function encodeToRandomBytes(src: number[], random?: number) {
  const seed = (typeof random === 'number' ? random : getRandomInt(256)) % 256
  const dest: number[] = [seed]

  for (let i = 0; i < src.length; i += 1) {
    dest.push((src[i] + (i % 256) + seed) % 256)
  }

  return dest
}

export function decodeRandomBytes(bytes: number[]) {
  const dest: number[] = []

  if (bytes.length >= 2) {
    const seed = bytes[0]
    for (let i = 0; i < bytes.length; i += 1) {
      if (i > 0) {
        let n = 256 + bytes[i] - (((i - 1) % 256) + seed)

        while (n < 0) {
          n += 256
        }

        dest.push(n % 256)
      }
    }
  }

  return dest
}

export function encodeToRandomHexString(str: string, random?: number) {
  return bytes2hex(encodeToRandomBytes(str2bytes(str), random))
}

export function decodeRandomHexString(hex: string) {
  return bytes2str(decodeRandomBytes(hex2bytes(hex)))
}
