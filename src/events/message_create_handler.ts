import type { Message } from 'discord.js'
import { Events } from 'discord.js'

import { logger } from '../logger/index.js'
import { parse_message_object } from '../utils/message_utils.js'
import { EventHandler } from './index.js'

export default class MessageHandler extends EventHandler {
  event_name = [Events.MessageCreate, Events.MessageDelete]

  public async process(event: Events, msg: Message): Promise<void> {
    // const msg = raw.partial ? await raw.fetch() : raw
    const is_self = msg.author && msg.author.id === msg.client.user?.id
    if (msg.system || is_self)
      return
    const parsed_msg = await parse_message_object(msg)
    logger.trace(parsed_msg, event.split(/(?=[A-Z])/).join(' ').toUpperCase())
  }
}
