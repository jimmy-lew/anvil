import type { ClientEvents } from 'discord.js'

export type Event<K extends keyof ClientEvents = keyof ClientEvents> = {
  [P in K]: {
    event: P
    data: ClientEvents[P]
    timestamp: number
  };
}[K]
