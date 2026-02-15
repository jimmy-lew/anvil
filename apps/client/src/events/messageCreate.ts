import type { Events, Message } from 'discord.js'
import type { Event } from '@/types'
import { MessageType } from 'discord.js'
import { Effect } from 'effect'
import { canSend, send } from '@/utils'

function handleUserJoin(msg: Message) {
  const member = msg.member

  if (!canSend(msg.channel)) {
    // logger.error('Bot does not have permission to send messages in system channel')
    return
  }

  send(
    msg.channel,
    `Welcome to the Smithy ${member?.user}!\n\nTo get started, I'd recommend going to <#1442865424994930738> to find a whole bunch of great tips to get started.\n\nFeel free to post your work for critique, ask questions on modeling, etc in <#1442713854604869672>. We're in <#703082230486138923> which serves as our general chat!\n\nYou may also see a couple of us in the VC, streaming our modeling. Feel free to join us!`,
    1000,
  )
}

export const onMessage = Effect.fn('event.handleMessageCreate')(function* (
  event: Event<Events.MessageCreate>,
) {
  const { data: [msg] } = event
  const isSelf = msg.author && msg.author.id === msg.client.user?.id
  if (isSelf)
    return
  if (msg.type === MessageType.UserJoin) {
    handleUserJoin(msg)
  }
  if (msg.content === '!ping') {
    send(msg.channel, 'pong')
  }
})
