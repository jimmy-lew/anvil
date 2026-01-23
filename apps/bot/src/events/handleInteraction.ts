import type { CommandInteraction } from 'discord.js'
import type { Command } from '@/commands'
import type { EventRecord } from '@/events'

import { AutocompleteInteraction, ChatInputCommandInteraction, Events, MessageFlags } from 'discord.js'

import { RateLimiter } from 'discord.js-rate-limiter'
import { CommandDeferType, CommandStore } from '@/commands'
import { EventHandler } from '@/events'

export default class CommandHandler extends EventHandler {
  event_name = [Events.InteractionCreate]
  rate_limiter = new RateLimiter(10, 30 * 1000)

  async handle_defer(intr: CommandInteraction, defer_type: CommandDeferType): Promise<boolean> {
    if (defer_type === CommandDeferType.NONE)
      return true
    await intr.deferReply({ flags: defer_type === CommandDeferType.HIDDEN ? MessageFlags.Ephemeral : undefined })
    return intr.deferred
  }

  async handle_autocomplete(intr: AutocompleteInteraction, cmd: Command): Promise<void> {
    if (!cmd.autocomplete) {
      return
    }

    const opt = intr.options.getFocused(true)
    const choices = (await cmd.autocomplete(intr, opt)).slice(0, 25)
    await intr.respond(choices)
  }

  async process(event: Events, event_record: EventRecord, intr: CommandInteraction | AutocompleteInteraction): Promise<void> {
    const is_self_or_bot = intr.user.id === intr.client.user?.id || intr.user.bot
    if (is_self_or_bot)
      return

    const is_rate_limited = this.rate_limiter.take(intr.user.id)
    if (is_rate_limited)
      return

    const store = await CommandStore.get_instance()
    const is_input_or_autocomplete = intr instanceof ChatInputCommandInteraction || intr instanceof AutocompleteInteraction
    const parts = is_input_or_autocomplete
      ? [
          intr.commandName,
          intr.options.getSubcommandGroup(false),
          intr.options.getSubcommand(false),
        ].filter(Boolean)
      : [intr.commandName]
    const cmd = store.find_command(parts)
    if (!cmd) {
      return
    }

    if (intr instanceof AutocompleteInteraction) {
      return await this.handle_autocomplete(intr, cmd)
    }

    const defer_successful = await this.handle_defer(intr, cmd.defer)
    if (!defer_successful) {
      return
    }

    const can_run = store.can_run(cmd, intr.user, intr.channel)
    if (!can_run) {
      return
    }

    await cmd.execute(intr)
  }
}
