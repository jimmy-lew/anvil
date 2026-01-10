import type { Logger } from 'pino'
import { DiscordAPIError } from 'discord.js'
import { nanoid } from 'nanoid'
import { pino, symbols, transport } from 'pino'
import { err as std_err_serializer } from 'pino-std-serializers'

const { asJsonSym } = symbols
const PINO_MOD_UNIX = 'node_modules/pino'

const FILE_OPT = { file: 'logs/log.jsonl', size: '10m', mkdir: true }

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

function parseStackLine(line: string) {
  const match = line.match(/^(.*)\s\((.*)\)$/)

  if (!match)
    return { func: '', file_loc: line }

  return { func: match[1], file_loc: match[2] }
}

function hooks(inst: Logger<never, boolean>): Logger {
  function get(target, name) {
    return name === asJsonSym ? asJson : target[name]
  }

  function trace(ctx: any) {
    const [stack, ..._] = new Error('_').stack.split('\n').slice(3).filter(s => !s.includes(PINO_MOD_UNIX))
    const { func, file_loc } = parseStackLine(stack.substring(7))
    ctx.func = func
    ctx.file_loc = file_loc
  }

  function overwiteTime(ctx: any, ...args: any[]) {
    if (!ctx.time)
      return args
    args[args.length - 1] = `,"time": ${ctx.time}`
    delete ctx.time
    return args
  }

  function asJson(...args) {
    const ctx = args[0] || {}
    // trace(ctx)
    args = overwiteTime(ctx, ...args)
    args[0] = ctx
    return inst[asJsonSym].apply(this, args)
  }
  return new Proxy(inst, { get })
}

export const logger = hooks(pino({
  level: 'trace',
  serializers: {
    err: err_serializer,
  },
  formatters: {
    bindings: () => ({}),
  },
  mixin: () => ({ log_id: nanoid() }),
}, pino_transport))
