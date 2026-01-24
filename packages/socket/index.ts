import { Socket } from 'node:net'

interface SocketOpts {
  defer: boolean
  reconnectAttempts: number
  reconnectDelay: number
}

export class InternalSocket extends Socket {
  private reconnectTimeout?: NodeJS.Timeout
  private attempts: number = 0
  private maxAttempts: number
  private baseReconnectDelay: number

  private port: number
  private host: string

  connected: boolean = false
  constructor(port: number, host: string, opts?: SocketOpts) {
    super()
    this.maxAttempts = opts?.reconnectAttempts ?? 5
    this.baseReconnectDelay = opts?.reconnectDelay ?? 4_000
    this.port = port
    this.host = host
    this.setupListeners()
    if (opts?.defer)
      return
    this.connect(port, host)
  }

  onData(_data: Buffer) {}
  onClose(_hadError: boolean) {}
  onConnect() {}
  onError(_err: Error) {}

  private setupListeners() {
    this.on('data', this.onData)
    this.on('error', (err: Error) => {
      this.connected = false
      this.onError(err)
    })
    this.on('close', (hadError: boolean) => {
      this.connected = false
      this.reconnect()
      this.onClose(hadError)
    })
    this.on('connect', () => {
      this.connected = true
      this.attempts = 0
      this.onConnect()
    })
  }

  reconnect(force: boolean = false) {
    if (this.reconnectTimeout)
      clearTimeout(this.reconnectTimeout)
    if (force) {
      this.attempts = 0
    }
    if (this.attempts >= this.maxAttempts) {
      process.stderr.write(`Failed to reconnect after ${this.maxAttempts} attempts. Giving up.`)
      return
    }
    const delay = this.baseReconnectDelay * 1.5 ** this.attempts
    this.attempts += 1
    process.stdout.write(`Reconnecting to ${this.host}:${this.port} in ${delay}ms (attempt ${this.attempts}/${this.maxAttempts})`)
    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.port, this.host)
    }, delay)
  }
}
