import type { Logger } from 'pino'
import { nanoid } from 'nanoid'
import { pino, symbols } from 'pino'

import { stream } from '@/logger/stream'

const { asJsonSym } = symbols
const PINO_MOD_UNIX = 'node_modules/pino'

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

  function _trace(ctx: any) {
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
    args = overwiteTime(ctx, ...args)
    args[0] = ctx
    return inst[asJsonSym].apply(this, args)
  }
  return new Proxy(inst, { get })
}

export const logger = hooks(pino({
  level: 'trace',
  formatters: { bindings: () => ({}) },
  mixin: () => ({ log_id: nanoid() }),
}, stream()))
