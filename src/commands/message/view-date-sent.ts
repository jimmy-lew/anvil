import type { MessageContextMenuCommandInteraction, PermissionsString } from 'discord.js'
import type { Command } from '../index.js'
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder } from 'discord.js'

import { RateLimiter } from 'discord.js-rate-limiter'
import { DateTime } from 'luxon'
import { send_message } from '../../utils'
import { CommandDeferType } from '../index.js'

const metadata = new ContextMenuCommandBuilder()
  .setName('date_sent')
  .setContexts(0)
  .setType(ApplicationCommandType.Message)
  .toJSON()

export default class ViewDateSent implements Command {
  public cooldown = new RateLimiter(1, 5000)
  public defer = CommandDeferType.HIDDEN
  public perms: PermissionsString[] = []
  metadata = metadata

  public async execute(intr: MessageContextMenuCommandInteraction): Promise<void> {
    const date = DateTime.fromJSDate(intr.targetMessage.createdAt).toLocaleString(DateTime.DATE_HUGE)
    const embed = new EmbedBuilder({ description: `This message was sent on ${date}` })
    await send_message(intr, embed)
  }
}
