import type { ClientEvents } from 'discord.js'
import type { Event } from '@/types'
import { Client as DiscordClient, Events, Options } from 'discord.js'
import { Context, Effect, Layer, Queue, Redacted, Runtime, Schema, Stream } from 'effect'
import { ConfigService } from './config'

class DiscordLoginError extends Schema.TaggedError<DiscordLoginError>()(
  'DiscordLoginError',
  {},
) { }

const createEventStream = Effect.fn('client.createEventStream')(function* (client: DiscordClient) {
  const queue = yield* Queue.unbounded<Event>()
  const events: Array<keyof ClientEvents> = [Events.ClientReady, Events.MessageCreate]
  const runtime = yield* Effect.runtime()
  const runFork = Runtime.runFork(runtime)
  events.map(event => client.on(event, (...args) => {
    const _event = { event, data: args, timestamp: Date.now() } as Event
    runFork(Queue.offer(queue, _event))
  }))

  return Stream.fromQueue(queue)
})

const createClient = Effect.fn('client.createClient')(function* () {
  const { intents, partials, caches } = yield* ConfigService
  return new DiscordClient({
    intents,
    partials,
    makeCache: Options.cacheWithLimits({ ...Options.DefaultMakeCacheSettings, ...caches }),
  })
})

export class Client extends Context.Tag('Client')<
  Client,
  {
    readonly client: DiscordClient
    readonly stream: Stream.Stream<any, never, never>
  }
>() {
  static readonly layer = Layer.effect(
    Client,
    Effect.gen(function* () {
      const config = yield* ConfigService
      const client = yield* createClient()

      yield* Effect.logInfo('Initialising client')

      const stream = yield* createEventStream(client)

      yield* Effect.tryPromise({
        try: () => client.login(Redacted.value(config.token)),
        catch: error => new DiscordLoginError(`Failed to login: ${error}`),
      })

      return Client.of({ client, stream })
    }),
  )
}
