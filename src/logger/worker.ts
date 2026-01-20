import { LogStream } from './logStream'
import { FileTransport, TcpTransport } from './transports'

const _FILE_OPT = { file: 'logs/log.jsonl', size: 10 * 1024 * 1024, mkdir: true }
const _SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function (..._args: any[]) {
  const file = new FileTransport()
  const tcp = new TcpTransport()
  const streams: any[] = [
    file,
    tcp,
    isDev ? process.stdout : null,
  ]
  const stream = new LogStream(...streams)
  return stream
}
