import type { Channel, User } from 'discord.js'
import type { Command } from './command'
import { GuildChannel, ThreadChannel } from 'discord.js'
import { loadStructures } from '@/utils'

export * from './command'

const command_structs = import.meta.glob('./**/*.ts', { import: 'default' })

const command_predicate = (_: unknown): _ is Command => true

export class CommandStore {
  private static instance = null
  commands: Command[]

  private constructor(commands: Command[]) { this.commands = commands }

  public static async get_instance(): Promise<CommandStore> {
    if (CommandStore.instance == null) {
      const commands = await loadStructures(command_structs, command_predicate, ['args.ts', 'command.ts', 'metadata.ts'])
      CommandStore.instance = new CommandStore(commands)
    }

    return CommandStore.instance
  }

  public get_commands() {
    return this.commands
  }

  public find_command(command_parts: string[]): Nullable<Command> {
    for (const [_, part] of command_parts.entries()) {
      const [head, ...rest] = this.commands.filter(cmd => cmd.metadata.name === part)
      if (!head)
        return null
      if (!rest.length)
        return head
    }
    return null
  }

  public async can_run(command: Command, user: User, channel: Channel): Promise<boolean> {
    if (command.cooldown && command.cooldown.take(user.id))
      return false
    if (!(channel instanceof GuildChannel || channel instanceof ThreadChannel))
      return true
    const has_perms = channel.permissionsFor(user).has(command.perms)
    return has_perms
  }
}
