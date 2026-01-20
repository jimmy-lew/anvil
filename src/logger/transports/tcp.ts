import { Socket } from 'node:net'
import { Writable } from 'node:stream'

export class TcpTransport extends Writable {
  client: Socket
  connected: boolean = false
  constructor() {
    super()
    const client = new Socket()
    const connect = () => {
      client.connect(9000, '127.0.0.1')
      this.connected = true
    }
    connect()
    this.client = client
    client.on('error', (error) => {
      // console.error('TCP transport error:', error)
      this.connected = false
    })
    client.on('close', () => {
      this.connected = false
      setTimeout(() => {
        connect()
      }, 10000)
    })
  }

  _write(chunk: any, _: string, callback: (error?: Error | null) => void): void {
    if (!this.connected) {
      // callback(new Error('TCP transport not connected'))
      return
    }
    this.client.write(chunk, callback)
  }
}
