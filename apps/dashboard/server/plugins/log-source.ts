/* eslint-disable no-console */
import type { Server, Socket } from 'node:net'
import type { RawLogItem } from '~/types/log'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:net'

// Handle server going down and reconnecting once it's back up
class LogSourceClient {
  private port: number = 9000
  private buffer: Buffer
  private separator: Buffer
  private server: Server

  constructor() {
    this.buffer = Buffer.alloc(0)
    // SSE messages are typically separated by double newline
    this.separator = Buffer.from('\n')
    this.server = createServer(socket => this.handleSocket(socket))
  }

  start() {
    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`Log source server listening on port ${this.port}`)
    })
  }

  private handleSocket(socket: Socket) {
    console.log(`Handling socket connection`, socket.remoteAddress)
    const listener = (chunk: Buffer) => this.handleChunk(chunk)
    socket.on('data', listener)
  }

  private handleChunk(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk])

    let offset = 0
    let splitIndex = -1

    while (true) {
      splitIndex = this.buffer.indexOf(this.separator, offset)
      if (splitIndex === -1)
        break
      const messageBytes = this.buffer.subarray(offset, splitIndex)
      this.processMessage(messageBytes)
      offset = splitIndex + this.separator.length
    }

    if (offset > 0) {
      this.buffer = this.buffer.subarray(offset)
    }
  }

  private processMessage(bytes: Buffer) {
    const line = bytes.toString('utf-8')
    try {
      const data = this.flattenJSON(JSON.parse(line)) as RawLogItem
      console.log(`Processing log ${data.log_id}`)
      cache_log(data)
      logBus.emit('log', data)
    }
    catch (e) {
      console.error('Error parsing log data:', e)
    }
  }

  private flattenJSON(obj: any, prefix = '', result: any = {}) {
    const handleKVPair = (e: [string, unknown]) => {
      const [k, v] = e
      const newKey = prefix && prefix !== 'meta' ? `${prefix}.${k}` : k
      if (!v || typeof v !== 'object') {
        result[newKey] = v
        return result
      }
      return this.flattenJSON(v, newKey, result)
    }
    Object.entries(obj).map(handleKVPair)
    return result
  }
}

export default defineNitroPlugin((_) => {
  const client = new LogSourceClient()
  client.start()
})
