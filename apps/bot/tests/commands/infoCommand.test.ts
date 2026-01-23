import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import InfoCommand from '../../src/commands/chat/info'
import { createMockInteraction } from '../test-utils'
import { EmbedBuilder } from 'discord.js'

// Mock the sendMessage utility
vi.mock('../../src/utils', () => ({
  sendMessage: vi.fn(),
}))

import { sendMessage } from '../../src/utils'

describe('InfoCommand', () => {
  let command: InfoCommand

  beforeEach(() => {
    command = new InfoCommand()
  })

  it('should have correct metadata', () => {
    expect(command.metadata.name).toBe('info')
    expect(command.metadata.description).toBe('View bot info')
  })

  it('should have correct defer type', () => {
    expect(command.defer).toBe('HIDDEN')
  })

  it('should have no required permissions', () => {
    expect(command.perms).toEqual([])
  })

  describe('execute', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should handle "about" option', async () => {
      const mockInteraction = createMockInteraction('info')
      mockInteraction.options.getString = vi.fn().mockReturnValue('ABOUT')

      await command.execute(mockInteraction)

      expect(sendMessage).toHaveBeenCalled()
      const [interaction, embed] = vi.mocked(sendMessage).mock.calls[0]
      expect(interaction).toBe(mockInteraction)
      expect(embed).toBeInstanceOf(EmbedBuilder)
      expect((embed as EmbedBuilder).data.title).toBe('Anvil - About')
    })

    it('should handle "translate" option', async () => {
      const mockInteraction = createMockInteraction('info')
      mockInteraction.options.getString = vi.fn().mockReturnValue('TRANSLATE')

      await command.execute(mockInteraction)

      expect(sendMessage).toHaveBeenCalled()
      // The translate option currently doesn't create an embed
      const [interaction, content] = vi.mocked(sendMessage).mock.calls[0]
      expect(interaction).toBe(mockInteraction)
    })

    it('should call sendMessage with interaction and embed', async () => {
      const mockInteraction = createMockInteraction('info')
      mockInteraction.options.getString = vi.fn().mockReturnValue('ABOUT')

      await command.execute(mockInteraction)

      expect(sendMessage).toHaveBeenCalledTimes(1)
      expect(sendMessage).toHaveBeenCalledWith(
        mockInteraction,
        expect.any(EmbedBuilder)
      )
    })
  })
})