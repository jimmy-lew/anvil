import type { ChatInputCommandInteraction, PermissionsString } from 'discord.js'

import type { Command } from '../index'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { send_message } from '../../utils'
import { CommandDeferType } from '../index'

enum InfoOption {
  ABOUT = 'ABOUT',
  TRANSLATE = 'TRANSLATE',
}

const metadata = new SlashCommandBuilder()
  .setName('info')
  .setDescription('View bot info')
  .setContexts(0)
  .addStringOption(
    opt => opt
      .setName('option')
      .setDescription('Option.')
      .addChoices(
        { name: 'about', value: InfoOption.ABOUT },
        { name: 'translate', value: InfoOption.TRANSLATE },
      )
      .setRequired(true),
  )
  .toJSON()

export default class InfoCommand implements Command {
  public defer = CommandDeferType.HIDDEN
  public perms: PermissionsString[] = []
  public metadata = metadata

  public async execute(intr: ChatInputCommandInteraction): Promise<void> {
    const args = intr.options.getString('option') as InfoOption

    let embed: EmbedBuilder
    switch (args) {
      case InfoOption.ABOUT: {
        embed = new EmbedBuilder(
          {
            title: 'Anvil - About',
            description: 'Anvil is the official administrative bot of The Pole and Axe Smithy. Its purpose is to maintain order, provide essential moderation, and secure the forge, ensuring a clean and focused environment for all aspiring Hytale texture and model creators.',
            fields: [
              {
                name: 'Author',
                value: '[beliql](https://github.com/jimmy-lew)',
              },
              {
                name: 'Links',
                value: '[View Source Code](https://github.com/)',
              },
            ],
          },
        )
        break
      }
      case InfoOption.TRANSLATE: {
        // embed = getEmbed('displayEmbeds.translate')
        // for (const langCode of Language.Enabled) {
        //   embed.addFields([
        //     {
        //       name: Language.Data[langCode].nativeName,
        //       value: getRef('meta.translators', langCode),
        //     },
        //   ])
        // }
        break
      }
      // default: { }
    }

    await send_message(intr, embed)
  }
}
