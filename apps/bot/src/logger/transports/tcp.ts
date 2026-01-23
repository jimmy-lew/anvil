import type { Socket } from 'node:net'
import { Writable } from 'node:stream'

export class TcpTransport extends Writable {
  client: Socket
  connected: boolean = false

  constructor(socket: Socket) {
    super()
    this.client = socket
    this.connected = socket.writable

    this.client.on('error', () => {
      this.connected = false
    })
    this.client.on('close', () => {
      this.connected = false
    })
    this.client.on('connect', () => {
      this.connected = true
    })
  }

  _write(chunk: any, _: string, callback: (error?: Error | null) => void): void {
    if (!this.connected) {
      callback?.()
      return
    }
    this.client.write(chunk, callback)
  }
}
