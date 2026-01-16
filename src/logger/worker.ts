import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'

import { Stream } from './logStream'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function transport(..._args) {
  const file = await fileTransport(FILE_OPT)
  const streams: any[] = [file, await sseTransport(SSE_OPT), isDev ? process.stdout : null].filter(Boolean)
  const stream = new Stream(...streams)
  // We only declare this here due to stream lifecycle conflict from ThreadStream
  stream._destroy = stream.clean

  return stream
}
