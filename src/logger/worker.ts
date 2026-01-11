import { multistream } from 'pino'

import build from 'pino-abstract-transport'

import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'
import tursoTransport from './tursoTransport'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function transport(..._args) {
  const streams: any[] = [
    { level: 'trace', stream: await fileTransport(FILE_OPT) },
    { level: 'trace', stream: await sseTransport(SSE_OPT) },
    isDev ? { level: 'trace', stream: process.stdout } : null,
  ].filter(Boolean)

  const streamOpts = {
    parse: 'lines',
    metadata: true,
    close(err, cb) {
      let expected = 0
      for (const transport of streams) {
        expected++
        transport.stream.on('close', () => --expected === 0 && cb(err))
        transport.stream.end()
      }
    },
  }
  // @ts-expect-error pino jank
  return build((stream) => {
    const multi = multistream(streams, { dedupe: false })
    stream.on('data', function (chunk) {
      const { lastTime, lastMsg, lastObj, lastLevel } = this
      // @ts-expect-error pino jank
      multi.lastLevel = lastLevel
      // @ts-expect-error pino jank
      multi.lastMsg = lastMsg
      // @ts-expect-error pino jank
      multi.lastTime = lastTime
      // @ts-expect-error pino jank
      multi.lastObj = lastObj
      multi.write(`${chunk}\n`)
    })
  }, streamOpts)
}
