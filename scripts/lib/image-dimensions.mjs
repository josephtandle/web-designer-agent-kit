import { readFileSync } from 'node:fs'

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3,
  0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb,
  0xcd, 0xce, 0xcf,
])

export function imageDimensionsFromBytes(bytes) {
  if (bytes.length >= 33 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    if (bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') return null
    const width = bytes.readUInt32BE(16)
    const height = bytes.readUInt32BE(20)
    return width > 0 && height > 0 ? { width, height } : null
  }
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset++
    if (offset >= bytes.length) return null
    const marker = bytes[offset++]
    if (marker === 0xd9 || marker === 0xda) return null
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 2 > bytes.length) return null
    const length = bytes.readUInt16BE(offset)
    if (length < 2 || offset + length > bytes.length) return null
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (length < 8) return null
      const height = bytes.readUInt16BE(offset + 3)
      const width = bytes.readUInt16BE(offset + 5)
      return width > 0 && height > 0 ? { width, height } : null
    }
    offset += length
  }
  return null
}

export function imageDimensions(file) {
  return imageDimensionsFromBytes(readFileSync(file))
}
