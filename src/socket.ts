import { Socket } from 'node:net'
import { LineBuffer } from './utils'

export class ServerSocket extends Socket {
  private lineBuffer = new LineBuffer()
  private messageHandlers: Set<(message: any) => void> = new Set()
  private reconnectTimeout?: NodeJS.Timeout
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private baseReconnectDelay: number = 4000
  private port: number
  private host: string

  constructor(port: number = 9000, host: string = '127.0.0.1') {
    super()
    this.port = port ?? process.env.DASHBOARD_PORT ?? 9000
    this.host = host ?? process.env.DASHBOARD_HOST ?? '127.0.0.1'
    this.setupListeners()
    this.connect(port, host)
    // console.log('Socket created', new Error().stack)
  }

  private setupListeners() {
    this.on('data', (data: Buffer) => {
      this.lineBuffer.process(data, (line) => {
        try {
          const message = JSON.parse(line.toString('utf8'))
          this.messageHandlers.forEach((handler) => {
            try {
              handler(message)
            }
            catch (error) {
              console.error('Message handler error:', error)
            }
          })
        }
        catch (error) {
          // Not valid JSON - silently ignore
        }
      })
    })

    this.on('connect', () => {
      this.reconnectAttempts = 0
      this.lineBuffer.clear()
    })

    this.on('close', () => {
      this.attemptReconnect()
    })
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts. Giving up.`,
      )
      return
    }

    const delay = this.baseReconnectDelay * 2 ** this.reconnectAttempts
    this.reconnectAttempts++

    console.log(
      `Reconnecting to ${this.host}:${this.port} in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.port, this.host)
    }, delay)
  }

  onMessage(handler: (message: any) => void): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  sendMessage(data: any): boolean {
    if (!this.writable) {
      return false
    }

    try {
      const json = typeof data === 'string' ? data : JSON.stringify(data)
      const buffer = Buffer.from(`${json}\n`, 'utf8')
      this.write(buffer)
      return true
    }
    catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }
}

let _socketInstance = null

export function getSocket() {
  if (!_socketInstance) {
    _socketInstance = new ServerSocket()
  }
  return _socketInstance
}

export const socket = getSocket()
