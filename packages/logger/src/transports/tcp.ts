import { Writable } from 'node:stream'
import { InternalSocket } from '@anvil/socket'

export class TcpTransport extends Writable {
  client: InternalSocket

  constructor(port: number = 9000, host: string = '127.0.0.1') {
    super()
    this.client = new InternalSocket(port, host)
  }

  _write(chunk: any, _: string, callback: (error?: Error | null) => void): void {
    if (!this.client.connected) {
      callback?.()
      return
    }
    this.client.write(chunk, callback)
  }
}
