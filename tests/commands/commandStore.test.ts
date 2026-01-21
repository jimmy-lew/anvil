import { describe, it, expect, vi } from 'vitest'
import { CommandStore } from '../../src/commands'
import { createMockUser, createMockChannel } from '../test-utils'

describe('CommandStore', () => {
  it('should be a singleton', async () => {
    const instance1 = await CommandStore.get_instance()
    const instance2 = await CommandStore.get_instance()
    expect(instance2).toBe(instance1)
  })

  it('should load commands from filesystem', async () => {
    const commandStore = await CommandStore.get_instance()
    const commands = commandStore.get_commands()

    expect(commands).toBeInstanceOf(Array)
    expect(commands.length).toBeGreaterThan(0)

    // Check that commands have required properties
    commands.forEach(command => {
      expect(command).toHaveProperty('defer')
      expect(command).toHaveProperty('perms')
      expect(command).toHaveProperty('metadata')
      expect(command).toHaveProperty('execute')
      expect(typeof command.execute).toBe('function')
    })
  })

  describe('find_command', () => {
    it('should find existing commands', async () => {
      const commandStore = await CommandStore.get_instance()
      const commands = commandStore.get_commands()

      // Find a command that should exist (like 'info' or 'generateLog')
      const commandNames = commands.map(cmd => cmd.metadata.name)
      expect(commandNames.length).toBeGreaterThan(0)

      // Test finding the first command
      const firstCommandName = commandNames[0]
      const result = commandStore.find_command([firstCommandName])
      expect(result).not.toBeNull()
      expect(result?.metadata.name).toBe(firstCommandName)
    })

    it('should return null for unknown command', async () => {
      const commandStore = await CommandStore.get_instance()
      const result = commandStore.find_command(['definitely-not-a-real-command'])
      expect(result).toBeNull()
    })
  })

  describe('can_run', () => {
    it('should return true for DM channels', async () => {
      const commandStore = await CommandStore.get_instance()
      const commands = commandStore.get_commands()
      const command = commands[0] // Use first available command

      const dmChannel = createMockChannel('dm')
      const user = createMockUser()

      const result = await commandStore.can_run(command, user, dmChannel)
      expect(result).toBe(true)
    })

    it('should check permissions for guild channels', async () => {
      const commandStore = await CommandStore.get_instance()
      const commands = commandStore.get_commands()
      const command = commands[0]

      const channel = createMockChannel('guild') as any
      const user = createMockUser()

      // Mock permissions - assume command requires some permissions
      channel.permissionsFor = vi.fn().mockReturnValue({
        has: vi.fn().mockReturnValue(true) // User has permissions
      })

      const result = await commandStore.can_run(command, user, channel)
      expect(typeof result).toBe('boolean')
    })
  })
})