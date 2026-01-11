import type { Events } from 'discord.js'
import { logger } from '../logger'

interface EventError {
  name: string
  message: string
  stack?: string // TODO: Implement stack parser
  code: number
}

export interface EventRecord {
  time?: number
  environment?: string
  event_name?: string
  error?: EventError
  duration_ms?: number
  meta?: Record<string, any>
}

export abstract class EventHandler {
  event_name: Events[]
  abstract process(name: Events, record: EventRecord, ...args: any[]): Promise<void>

  async _process(event_name: Events, ...args: any[]): Promise<void> {
    const start = Date.now()
    const event: EventRecord = {
      event_name: event_name.split(/(?=[A-Z])/).join('_').toUpperCase(),
      time: start,
      environment: 'dev',
    }
    try {
      await this.process(event_name, event, ...args)
    }
    catch (err) {
      event.error = {
        name: err.name,
        message: err.message,
        code: err.code,
      }
    }
    finally {
      event.duration_ms = Date.now() - start
      logger.trace(event)
    }
  }
}
