import type { TransformCallback } from 'node:stream'
import { Transform } from 'node:stream'
import { StringDecoder } from 'node:string_decoder'

const NEWLINE = 10
const CARRIAGE_RETURN = 13

export class ByteLineSplitter extends Transform {
  private decoder = new StringDecoder('utf8')
  private leftover: Buffer | null = null

  // High Water Mark: 16KB is usually the sweet spot for line-splitting performance
  constructor() {
    super({
      readableObjectMode: true,
      writableHighWaterMark: 16 * 1024,
    })
  }

  async _transform(chunk: Buffer, encoding: string, callback: TransformCallback): Promise<void> {
    let data = chunk

    if (this.leftover) {
      data = Buffer.concat([this.leftover, chunk])
      this.leftover = null
    }

    let start = 0
    while (true) {
      const index = data.indexOf(NEWLINE, start)

      if (index === -1) {
        // No more newlines, store the rest for next chunk
        this.leftover = data.subarray(start)
        break
      }

      const end = (index > start && data[index - 1] === CARRIAGE_RETURN) ? index - 1 : index

      const line = this.decoder.write(data.subarray(start, end))

      // 5. Backpressure handling
      if (!this.push(line)) {
        await new Promise<void>(resolve => this.once('drain', resolve))
      }

      start = index + 1
    }

    callback()
  }

  _flush(callback: TransformCallback): void {
    if (this.leftover) {
      // Flush remaining data through the decoder to catch partial multi-byte chars
      const final = this.decoder.write(this.leftover) + this.decoder.end()
      if (final)
        this.push(final)
    }
    callback()
  }
}
