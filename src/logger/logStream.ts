import type { TransformCallback } from 'node:stream'
import { Writable } from 'node:stream'
import { StringDecoder } from 'node:string_decoder'

const NEWLINE = 10
const CARRIAGE_RETURN = 13

export class Stream extends Writable {
  decoder = new StringDecoder('utf-8')
  buffer: Nullable<Buffer> = null
  streams: Writable[]

  constructor(...streams: any[]) {
    super()
    this.streams = streams.filter(this.validate)
  }

  async _write(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): Promise<void> {
    let data = chunk
    if (this.buffer) {
      data = Buffer.concat([this.buffer, chunk])
      this.buffer = null
    }
    let start = 0
    while (true) {
      const [isEnd, index] = await this.processChunk(data, start)
      if (isEnd)
        break
      start = index + 1
    }
    callback()
  }

  _final(callback: TransformCallback): void {
    if (this.buffer) {
      const final = this.decoder.write(this.buffer) + this.decoder.end()
      if (final)
        this.streams.map(s => s.write(`${final}\n`))
    }
    callback()
  }

  clean(error: Error | null, callback: (error?: Error | null) => void): void {
    let expected = 0
    for (const stream of this.streams) {
      expected++
      stream.on('close', () => --expected === 0 && callback(error))
      stream.end()
    }
  }

  async processChunk(data: Buffer, start: number): Promise<[boolean, number]> {
    const index = data.indexOf(NEWLINE, start)
    if (index === -1) {
      this.buffer = data.subarray(start)
      return [true, -1]
    }
    const end = (index > start && data[index - 1] === CARRIAGE_RETURN) ? index - 1 : index
    const line = this.decoder.write(data.subarray(start, end))
    // TODO: Handle backpressure
    this.streams.map(s => s.write(`${line}\n`))
    return [false, index]
  }

  validate(dest: any): dest is Writable {
    if (!dest)
      return false
    const stream = dest.write ? dest : dest.stream
    if (typeof stream.write !== 'function')
      throw new TypeError('Destination needs to implement either StreamEntry or DestinationStream interface')
    return true
  }
}
