import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'

import { LogStream } from './logStream'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function (..._args: any[]) {
  const file = await fileTransport(FILE_OPT)
  const sse = await sseTransport(SSE_OPT)
  const streams: any[] = [
    file,
    sse,
    isDev ? process.stdout : null,
  ]
  const stream = new LogStream(...streams)
  return stream
}
