import type { CacheWithLimitsOptions, GatewayIntentsString, Partials } from 'discord.js'

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
}

export interface Config {
  env: 'dev' | 'prod'
  client: ClientConfig
  logging: LoggingConfig
}

const config_file = readFileSync(new URL('../config/config.yaml', import.meta.url), 'utf-8')
const _config = parse(config_file) as Config
_config.client.token = process.env.DISCORD_BOT_TOKEN
_config.client.id = process.env.DISCORD_CLIENT_ID
export const config = Object.freeze(_config)
