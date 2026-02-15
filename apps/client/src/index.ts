import { Effect, Layer, Stream } from 'effect'
import { Client, ConfigService } from '@/core'
import { eventSink } from '@/events'

const Config = ConfigService.layer

const App = Client.layer.pipe(Layer.provide(Config))

const program = Effect.gen(function* () {
  const client = yield* Client
  yield* Stream.run(client.stream, eventSink)
})

const main = program.pipe(Effect.provide(App))
Effect.runPromise(main)
