import type { PrettyOptions } from 'pino-pretty'
import { join } from 'node:path'
import { DiscordAPIError } from 'discord.js'
import { pino, transport } from 'pino'
import pinoCaller from 'pino-caller'
import { err as std_err_serializer } from 'pino-std-serializers'

import { config } from '../config'

const is_dev_env = config.env === 'dev'

const pretty_stdout_options: PrettyOptions = {
  colorize: true,
  ignore: 'pid,hostname',
  translateTime: 'yyyy-mm-dd HH:MM:ss.l',
}
const file_transport_options = {
  ignore: 'pid,hostname',
  file: join('logs', 'log.jsonl'),
  frequency: 'daily',
  mkdir: true,
}

const pino_transport = transport({
  targets: [
    is_dev_env ? { target: 'pino-pretty', options: pretty_stdout_options } : null,
    { target: 'pino-roll', level: 'trace', options: file_transport_options },
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

export const logger = pinoCaller(pino({
  level: 'trace',
  serializers: {
    err: err_serializer,
  },
  formatters: {
    log: (rec) => {
      return rec
    },
    bindings: () => ({}),
  },
}, pino_transport))
