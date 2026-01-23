import { EventEmitter } from 'node:events'

export const logBus = new EventEmitter()
logBus.setMaxListeners(50)
