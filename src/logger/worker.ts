import pino from 'pino'

import build from 'pino-abstract-transport'

import fileTransport from 'pino-roll'
import sseTransport from 'pino-sse'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }
const SSE_OPT = { route: '/', port: 3333, cors: { origin: '*' } }

export default async function transport(..._args) {
  const streams: any[] = [
    {
      level: 'trace',
      stream: await fileTransport(FILE_OPT),
    },
    {
      level: 'trace',
      stream: await sseTransport(SSE_OPT),
    },
  ]

  const streamOpts = {
    parse: 'lines',
    metadata: true,
    close(err, cb) {
      let expected = 0
      for (const transport of streams) {
        expected++
        transport.stream.on('close', closeCb)
        transport.stream.end()
      }

      function closeCb() {
        if (--expected === 0)
          cb(err)
      }
    },
  }
  // @ts-expect-error pino jank
  return build((stream) => {
    const multi = pino.multistream(streams, { dedupe: false })
    stream.on('data', (chunk) => {
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
