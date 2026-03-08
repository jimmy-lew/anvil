import type { Event } from '@/types'
import { Events } from 'discord.js'
import { Effect, Match, Sink } from 'effect'
import { onMessage } from './messageCreate'

export const onReady = Effect.fn('client.ready')(function* (
  event: Event<Events.ClientReady>,
) {
  const { data: [client] } = event
  yield* Effect.logInfo(`Client logged in as ${client.user?.tag}`)
})

export const eventSink = Sink.forEach((event: Event) => {
  const res = Match.value(event).pipe(
    Match.when({ event: Events.ClientReady }, onReady),
    Match.when({ event: Events.MessageCreate }, onMessage),
    Match.orElse(e => Effect.logInfo(`Unhandled event: ${e.event}`)),
  )
  return res
})
