import build from 'pino-abstract-transport'

import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'
import multistream from './multistream'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }
const _TURSO_OPT = { url: '', token: '', table: null }

const isDev = process.env.NODE_ENV === 'dev'

export default async function transport(..._args) {
  const file = await fileTransport(FILE_OPT)
  const streams: any[] = [file, await sseTransport(SSE_OPT), isDev ? process.stdout : null].filter(Boolean)

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

  // TODO: Remove build and directly use node FastUTF8Stream with line splitting
  // @ts-expect-error pino jank
  return build((stream) => {
    const multi = multistream(streams)
    stream.on('data', function (chunk) {
      const { lastTime, lastMsg, lastObj, lastLevel } = this
      multi.lastLevel = lastLevel
      multi.lastMsg = lastMsg
      multi.lastTime = lastTime
      multi.lastObj = lastObj
      multi.write(`${chunk}\n`)
    })
  }, streamOpts)
}
