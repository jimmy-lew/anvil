import { nanoid } from 'nanoid'
import { Thread } from './thread'

export * from './hooks'

export interface Destination {
  write: (data: any) => void
}

export type LogHook = <T>(ctx: T) => T

export class Logger {
  private stream: Destination
  private hooks: LogHook[] = []

  constructor(dest: Destination, hooks?: LogHook[]) {
    this.stream = dest
    this.hooks = hooks ?? []
  }

  private _log(level: number, _ctx?: any, _msg?: string) {
    if (!_msg && typeof _ctx !== 'object') {
      _ctx = { msg: _ctx }
    }
    let ctx = {
      level,
      log_id: nanoid(),
      time: _ctx?.time ?? Date.now(),
      ..._ctx,
    }

    if (_msg) {
      ctx.msg = _msg // We want this to be the "last" field
    }

    ctx = this.hooks.reduce((acc, h) => h(acc), ctx)
    const ctx_buf = JSON.stringify(ctx)

    this.stream.write(`${ctx_buf}\n`)
  }

  trace(ctx: any, msg?: string) { return this._log(10, ctx, msg) }
  debug(ctx: any, msg?: string) { return this._log(20, ctx, msg) }
  info(ctx: any, msg?: string) { return this._log(30, ctx, msg) }
  warn(ctx: any, msg?: string) { return this._log(40, ctx, msg) }
  error(ctx: any, msg?: string) { return this._log(50, ctx, msg) }
  fatal(ctx: any, msg?: string) { return this._log(60, ctx, msg) }
}

export const logger = new Logger(Thread())
