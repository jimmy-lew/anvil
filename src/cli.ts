import { confirm, isCancel, outro, select, tasks, text } from '@clack/prompts'
import { logger } from './logger/index.js'

import { CommandRegistry } from './services'

async function main() {
  const option = await select({
    message: 'Why are you here today?:',
    options: [
      { value: 'start_bot', label: 'Start bot' },
      { value: 'view_commands', label: 'View commands' },
      { value: 'register_commands', label: 'Register commands' },
      { value: 'clear_commands', label: 'Clear commands' },
    ],
  })

  if (option === 'start_bot') {
    return
  }
  let registry: CommandRegistry

  await tasks([
    {
      title: 'Initialising registry',
      task: async () => {
        registry = new CommandRegistry()
        return 'Command registry initialised'
      },
    },
  ])

  if (option === 'view_commands') {
    const cmd_list = await registry.view()
    outro(cmd_list)
  }
  if (option === 'register_commands') {
    await tasks([
      {
        title: 'Registering commands',
        task: async () => {
          await registry.register()
        },
      },
    ])
    outro('All commands successfully registered')
  }
  if (option === 'clear_commands') {
    const remote_only = (await registry.resolve_local_and_remote()).pop()
    const remote_list = registry.format_cmd_list(remote_only)
    const confirmation = await confirm({ message: `This action will delete all remote commands:\n\t${remote_list}` })
    if (!confirmation)
      return
    await registry.clear()
    outro('Successfully cleared commands')
  }

  if (isCancel(option)) {
    console.log('Operation cancelled')
    process.exit(0)
  }
}

main()
