import type { Events } from 'discord.js'

export abstract class EventHandler {
  event_name: Events[]
  abstract process(event_name?: Events, ..._args: any[]): Promise<void>
}
