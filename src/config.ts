import type { CacheWithLimitsOptions, GatewayIntentsString, Partials } from 'discord.js'
import type { SSETransportOptions } from 'pino-sse'

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

export interface ClientConfig {
  id: string
  token: string
  intents: GatewayIntentsString[]
  partials: (keyof typeof Partials)[]
  caches: CacheWithLimitsOptions
}

export interface LoggingConfig {
  webhookURL: string
  sse: SSETransportOptions
}

export interface Config {
  env: 'dev' | 'prod'
  client: ClientConfig
  logging: LoggingConfig
}

const config_file = readFileSync(new URL('../config/config.yaml', import.meta.url), 'utf-8')
export const config = Object.freeze(parse(config_file)) as Readonly<Config>
