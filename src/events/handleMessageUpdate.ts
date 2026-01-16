import type { Message } from 'discord.js'
import type { EventRecord } from './index'
import { Events } from 'discord.js'

import { parseMsg } from '../utils'
import { EventHandler } from './index'

// Highly dependent on cache
// TODO: More robust caching strategy
export default class MessageHandler extends EventHandler {
  event_name = [Events.MessageUpdate]

  public async process(event: Events, event_record: EventRecord, prev: Message, cur: Message): Promise<void> {
    const is_self = cur.author.id === cur.client.user?.id
    if (cur.system || !cur.author || is_self)
      return

    const parsed_msg = await parseMsg(cur)
    event_record.meta = parsed_msg
  }
}
