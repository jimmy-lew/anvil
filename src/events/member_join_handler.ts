import type { GuildMember } from 'discord.js'
import { Events } from 'discord.js'

import { logger } from '../logger'
import { can_send, send_message } from '../utils'
import { EventHandler } from './index.js'

export default class GuildMemberJoinHandler extends EventHandler {
  event_name = [Events.GuildMemberAdd]

  public async process(event: Events, member: GuildMember): Promise<void> {
    logger.info(`${member.user.username} has joined`)

    const notify_channel = member.guild.systemChannel

    if (!notify_channel) {
      logger.error('Guild system channel does not exist')
      return
    }

    if (!can_send(notify_channel)) {
      logger.error('Bot does not have permission to send messages in system channel')
      return
    }

    await send_message(
      notify_channel,
      `Welcome to the Smithy ${member.user}!\n\nTo get started, I'd recommend going to <#1442865424994930738> to find a whole bunch of great tips to get started.\n\nFeel free to post your work for critique, ask questions on modeling, etc in <#1442713854604869672>. We're in <#703082230486138923> which serves as our general chat!\n\nYou may also see a couple of us in the VC, streaming our modeling. Feel free to join us!`,
      1000,
    )
  }
}
