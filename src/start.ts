import type { EventHandler } from './events/event_handler'

import { CommandStore } from './commands'

import { config } from './config.js'
import { logger } from './logger'
import { Anvil } from './models/bot'
import { load_structures } from './utils'

const event_structs = import.meta.glob('./events/**/*.ts', { import: 'default' })
const event_predicate = (_: unknown): _ is EventHandler => true

async function start(): Promise<void> {
  const _ = await CommandStore.get_instance() // Initialize at top level in order for compiler macro to trigger
  // const buttons: Button[] = []
  // const reactions: Reaction[] = []
  // const triggers: Trigger[] = []
  // const jobs: Job[] = []
  const events = await load_structures(event_structs, event_predicate, ['event_handler.ts'])

  const anvil = new Anvil(config.client, events)
  await anvil.start()
}

process.on('unhandledRejection', (reason, _promise) => {
  logger.error(reason, 'An unhandled promise rejection occurred.')
})

start().catch((error) => {
  logger.error(error, 'An unspecified error occurred.')
})
