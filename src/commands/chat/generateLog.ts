import type { ChatInputCommandInteraction, PermissionsString } from 'discord.js'

import type { Command } from '../index'
import { SlashCommandBuilder } from 'discord.js'
import { logger } from '../../logger'
import { sendMessage } from '../../utils'
import { CommandDeferType } from '../index'

const metadata = new SlashCommandBuilder()
  .setName('generate_log')
  .setDescription('Generate mock log data')
  .setContexts(0)
  .addStringOption(
    opt => opt
      .setName('option')
      .setDescription('Option.')
      .addChoices(
        { name: 'info', value: 'INFO' },
        { name: 'debug', value: 'DEBUG' },
        { name: 'warn', value: 'WARN' },
        { name: 'error', value: 'ERROR' },
        { name: 'fatal', value: 'FATAL' },
      )
      .setRequired(true),
  )
  .toJSON()

export default class GenerateLogCommand implements Command {
  public defer = CommandDeferType.HIDDEN
  public perms: PermissionsString[] = []
  public metadata = metadata

  public async execute(intr: ChatInputCommandInteraction): Promise<void> {
    const args = intr.options.getString('option').toLowerCase()
    logger[args](`This is a mock ${args.toUpperCase()} call`)
    await sendMessage(intr, `This is a mock ${args.toUpperCase()} call`)
  }
}
