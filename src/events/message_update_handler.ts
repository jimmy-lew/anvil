import type { Message } from 'discord.js'
import { Events } from 'discord.js'

import { logger } from '../logger/index.js'
import { parse_message_object } from '../utils/message_utils.js'
import { EventHandler } from './index.js'

export default class MessageHandler extends EventHandler {
  event_name = [Events.MessageUpdate]

  public async process(event: Events, prev: Message, cur: Message): Promise<void> {
    const is_self = cur.author.id === cur.client.user?.id
    if (cur.system || !cur.author || is_self)
      return

    const parsed_msg = await parse_message_object(cur)
    // Highly dependent on cache
    // TODO: More robust caching strategy
    logger.trace({ ...parsed_msg, prev_content: prev.content }, 'Messaged edited')
  }
}
