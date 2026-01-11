import type { MessageContextMenuCommandInteraction, PermissionsString } from 'discord.js'
import type { Command } from '../index'
import { ApplicationCommandType, ContextMenuCommandBuilder, EmbedBuilder } from 'discord.js'

import { RateLimiter } from 'discord.js-rate-limiter'
import { send_message } from '../../utils'
import { CommandDeferType } from '../index'

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
    const date = new Date(intr.targetMessage.createdTimestamp).toLocaleString('en-SG')
    const embed = new EmbedBuilder({ description: `This message was sent on ${date}` })
    await send_message(intr, embed)
  }
}
