import type { CacheWithLimitsOptions, GatewayIntentsString } from 'discord.js'
import type { Redacted } from 'effect'
import { readFile } from 'node:fs/promises'
import { Partials } from 'discord.js'
import { Config, Context, Effect, Layer, Schema } from 'effect'
import { parse as parseYaml } from 'yaml'

const Environment = Schema.Literal('dev', 'staging', 'uat', 'prod')
type PartialKey = keyof typeof Partials

interface ClientConfig {
  readonly token: Redacted.Redacted
  readonly id: string
  readonly env: typeof Environment.Type
  readonly intents: GatewayIntentsString[]
  readonly partials: Partials[]
  readonly caches: CacheWithLimitsOptions
}

class ConfigError extends Schema.TaggedError<ConfigError>()(
  'ConfigError',
  {},
) {}

const _loadYamlConfig = Effect.fn('Config.loadYamlConfig')(function* (
  path: string,
) {
  return yield* Effect.tryPromise({
    try: () => readFile(path, 'utf8'),
    catch: () => {},
  }).pipe(Effect.flatMap(parseYaml))
})

export class ConfigService extends Context.Tag('ConfigService')<
  ConfigService,
  ClientConfig
>() {
  static readonly layer = Layer.effect(
    ConfigService,
    Effect.gen(function* () {
      const token = yield* Config.redacted('DISCORD_BOT_TOKEN')
      const id = yield* Config.string('DISCORD_CLIENT_ID')
      const env = yield* Schema.Config('NODE_ENV', Environment).pipe(Config.withDefault('dev'))

      if (!token || !id)
        return yield* new ConfigError('Discord credentials missing')

      const intents: GatewayIntentsString[] = [
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildMessageReactions',
        'GuildMembers',
        'GuildModeration',
        'DirectMessages',
        'DirectMessageReactions',
      ]
      const partialKeys: PartialKey[] = []
      const partials: Partials[] = partialKeys.map(p => Partials[p])
      const caches: CacheWithLimitsOptions = {
        MessageManager: 10_000,
      }

      return ConfigService.of({ token, id, env, intents, partials, caches })
    }),
  )
}
