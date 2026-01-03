import type { Logger } from 'pino'
import { join } from 'node:path'
import { DiscordAPIError } from 'discord.js'
import { pino, symbols, transport } from 'pino'
import { err as std_err_serializer } from 'pino-std-serializers'
import { v4 as uuid } from 'uuid'

const { asJsonSym } = symbols
const PINO_MOD_UNIX = 'node_modules/pino'

const FILE_OPT = {
  file: join('logs', 'log.jsonl'),
  frequency: 'daily',
  mkdir: true,
}

const pino_transport = transport({
  targets: [
    { target: 'pino-roll', level: 'trace', options: FILE_OPT },
    { target: 'pino-sse', level: 'trace' },
  ],
})

function err_serializer(err: Error) {
  if (!(err instanceof DiscordAPIError))
    return std_err_serializer(err)

  return {
    type: 'DiscordAPIError',
    message: err.message,
    code: err.code,
    method: err.method,
    url: err.url,
    stack: err.stack,
  }
}

function trace(inst: Logger<never, boolean>): Logger {
  function get(target, name) {
    return name === asJsonSym ? asJson : target[name]
  }

  function asJson(...args) {
    args[0] = args[0] || Object.create(null)
    const [stack, ..._] = new Error('_').stack.split('\n').slice(2).filter(s => !s.includes(PINO_MOD_UNIX))
    args[0].caller = stack.substring(7)
    return inst[asJsonSym].apply(this, args)
  }
  return new Proxy(inst, { get })
}

export const logger = trace(pino({
  level: 'trace',
  serializers: {
    err: err_serializer,
  },
  formatters: {
    bindings: () => ({}),
  },
  mixin: () => ({ log_id: uuid() }),
}, pino_transport))
