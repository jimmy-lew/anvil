import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'

import multistream from './multistream'
import { ByteLineSplitter } from './split'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function transport(..._args) {
  const file = await fileTransport(FILE_OPT)
  const streams: any[] = [file, await sseTransport(SSE_OPT), isDev ? process.stdout : null].filter(Boolean)
  const multi = multistream(streams)

  const stream = new ByteLineSplitter()
  stream._destroy = function (err, cb) {
    let expected = 0
    for (const transport of streams) {
      expected++
      transport.stream.on('close', () => --expected === 0 && cb(err))
      transport.stream.end()
    }
  }
  stream.on('data', (chunk) => {
    multi.write(`${chunk}\n`)
  })

  return stream
}
