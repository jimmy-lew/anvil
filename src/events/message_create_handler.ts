import type { Message } from 'discord.js'
import type { EventRecord } from './index'
import { Events, MessageType } from 'discord.js'

import { logger } from '../logger'
import { can_send, parse_message_object, send_message } from '../utils'
import { EventHandler } from './index.js'

async function handleUserJoin(msg: Message) {
  const member = msg.member

  if (!can_send(msg.channel)) {
    logger.error('Bot does not have permission to send messages in system channel')
    return
  }

  await send_message(
    msg.channel,
    `Welcome to the Smithy ${member.user}!\n\nTo get started, I'd recommend going to <#1442865424994930738> to find a whole bunch of great tips to get started.\n\nFeel free to post your work for critique, ask questions on modeling, etc in <#1442713854604869672>. We're in <#703082230486138923> which serves as our general chat!\n\nYou may also see a couple of us in the VC, streaming our modeling. Feel free to join us!`,
    1000,
  )
}

export default class MessageHandler extends EventHandler {
  event_name = [Events.MessageCreate, Events.MessageDelete]

  public async process(event: Events, event_record: EventRecord, msg: Message): Promise<void> {
    const is_self = msg.author && msg.author.id === msg.client.user?.id
    if (is_self)
      return
    if (msg.type === MessageType.UserJoin) {
      await handleUserJoin(msg)
      return
    }
    if (msg.system)
      return
    const parsed_msg = await parse_message_object(msg)
    event_record.meta = parsed_msg
  }
}
