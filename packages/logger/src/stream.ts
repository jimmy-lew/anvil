import type { TransformCallback } from 'node:stream'
import { Writable } from 'node:stream'
import { LineBuffer } from '@lib/utils'

type Nullable<T> = T | null

export class LogStream extends Writable {
  private lineBuffer = new LineBuffer()
  private streams: Writable[]

  constructor(...streams: any[]) {
    super()
    this.streams = streams.filter(this.validate)
  }

  _write(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.lineBuffer.process(chunk, (line) => {
      const text = line.toString('utf-8')
      this.streams.forEach(s => s.write(`${text}\n`))
    })
    callback()
  }

  _final(callback: TransformCallback): void {
    this.lineBuffer.flush((line) => {
      const text = line.toString('utf-8')
      this.streams.forEach(s => s.write(`${text}\n`))
    })
    callback()
  }

  _destroy(error: Nullable<Error>, callback: (error?: Nullable<Error>) => void): void {
    let expected = 0
    for (const stream of this.streams) {
      expected++
      stream.on('close', () => --expected === 0 && callback(error))
      stream.end()
    }
    callback()
  }

  validate(dest: any): dest is Writable {
    if (!dest)
      return false
    const stream = dest.write ? dest : dest.stream
    if (typeof stream?.write !== 'function') {
      throw new TypeError('Destination needs to implement either StreamEntry or DestinationStream interface')
    }
    return true
  }
}
