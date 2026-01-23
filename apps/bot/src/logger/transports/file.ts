import * as fs from 'node:fs'
import * as path from 'node:path'
import { Writable } from 'node:stream'
import SonicBoom from 'sonic-boom'

interface Options {
  filename: string
  maxSize: number // in bytes
  encoding?: BufferEncoding
}

export class FileTransport extends Writable {
  private filename: string
  private maxSize: number
  private currentSize: number = 0
  private stream?: SonicBoom

  constructor(options?: Options) {
    super()
    this.filename = path.resolve(options?.filename ?? 'logs/log.jsonl')
    this.maxSize = options?.maxSize ?? 10 * 1024 * 1024

    this._initSync()
  }

  private _initSync(): void {
    // Ensure directory exists
    const dir = path.dirname(this.filename)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (fs.existsSync(this.filename)) {
      const stats = fs.statSync(this.filename)
      this.currentSize = stats.size
    }
    this._openStream()
  }

  private _openStream(): void {
    this.stream = new SonicBoom({
      dest: this.filename,
      mkdir: true,
    })

    // Bubble up errors from the internal stream
    this.stream.on('error', err => this.emit('error', err))
  }

  private async rotate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stream)
        return resolve()

      this.stream.flush()

      const timestamp = Date.now()
      const archivedPath = `${this.filename}.${timestamp}`

      fs.rename(this.filename, archivedPath, (err) => {
        if (err)
          return reject(err)

        this.currentSize = 0
        this.stream?.reopen()
        resolve()
      })
    })
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const len = Buffer.byteLength(chunk, encoding)

    if (this.currentSize + len < this.maxSize)
      return this._performWrite(chunk, callback)
    this.rotate()
      .then(() => {
        this._performWrite(chunk, callback)
      })
      .catch(callback)
  }

  private _performWrite(chunk: any, callback: (error?: Error | null) => void): void {
    if (!this.stream) {
      return callback(new Error('Internal stream not initialized'))
    }

    const len = Buffer.byteLength(chunk)
    const written = this.stream.write(chunk)

    this.currentSize += len

    if (written) {
      callback()
    }
    else {
      this.stream.once('drain', callback)
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    if (this.stream) {
      this.stream.end()
      this.stream.once('finish', callback)
    }
    else {
      callback()
    }
  }

  _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    if (this.stream) {
      this.stream.destroy()
    }
    callback(error)
  }
}
