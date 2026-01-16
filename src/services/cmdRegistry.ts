import type {
  APIApplicationCommand,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
import { CommandStore } from '../commands'
import { config } from '../config'

export class CommandRegistry {
  rest: REST = new REST({ version: '10' }).setToken(config.client.token)
  route = Routes.applicationCommands(config.client.id)

  async resolve_local_and_remote() {
    const store = await CommandStore.get_instance()
    const local_cmds = store.get_commands().map(cmd => cmd.metadata)
    const remote_cmds = (await this.rest.get(this.route)) as RESTGetAPIApplicationCommandsResult

    const local_on_remote = local_cmds.filter(lcl => remote_cmds.some(remote => remote.name === lcl.name))
    const local_only = local_cmds.filter(lcl => !remote_cmds.some(remote => remote.name === lcl.name))
    const remote_only = remote_cmds.filter(remote => !local_cmds.some(lcl => lcl.name === remote.name))

    return [local_on_remote, local_only, remote_only]
  }

  async view() {
    const [local_on_remote, local_only, remote_only] = (await this.resolve_local_and_remote()).map(this.format_cmd_list)
    return `Local and remote:\n\t${local_on_remote}\n   Local:\n\t${local_only}\n   Remote:\n\t${remote_only}`
  }

  async register() {
    const [local_on_remote, local_only, ..._] = await this.resolve_local_and_remote()
    if (local_only.length > 0) {
      local_only.map(async (cmd) => {
        await this.rest.post(this.route, { body: cmd })
      })
    }
    if (local_on_remote.length > 0) {
      local_on_remote.map(async (cmd) => {
        await this.rest.post(this.route, { body: cmd })
      })
    }
  }

  async clear() {
    await this.rest.put(this.route, { body: [] })
  }

  format_cmd_list(cmds: APIApplicationCommand[] | RESTPostAPIApplicationCommandsJSONBody[]) {
    return cmds.length > 0
      ? cmds.map((cmd: { name: string }) => `'${cmd.name}'`).join(', ')
      : 'N/A'
  }
}
