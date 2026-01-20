import type { EventHandler } from './events'

import { Anvil } from './bot'
import { CommandStore } from './commands'
import { config } from './config'
import { logger } from './logger'
import { loadStructures } from './utils'

const event_structs = import.meta.glob('./events/**/*.ts', { import: 'default' }) as Record<string, () => Promise<ObjectConstructor>>
const event_predicate = (_: unknown): _ is EventHandler => true

async function start(): Promise<void> {
  const _ = await CommandStore.get_instance() // Initialize at top level in order for compiler macro to trigger
  const events = await loadStructures(event_structs, event_predicate, ['event_handler.ts'])

  const anvil = new Anvil(config.client, events)
  await anvil.start()
}

process.on('unhandledRejection', (reason, _promise) => {
  logger.error(reason, 'An unhandled promise rejection occurred.')
})

process.on('SIGINT', async () => {
  logger.info('Shutting down...')
  await new Promise(resolve => setTimeout(resolve, 500)) // Give cleanup time
  process.exit(0)
})

start().catch((error) => {
  logger.error(error, 'An unspecified error occurred.')
})
