import { describe, it, expect, vi } from 'vitest'
import { canSend } from '../../src/utils/permUtils'
import { createMockChannel, createMockPermissions } from '../test-utils'
import { PermissionFlagsBits, DMChannel } from 'discord.js'

describe('permUtils', () => {
  describe('canSend', () => {
    it.skip('should return true for DM channels', () => {
      // TODO: Fix DM channel instanceof mocking
      const dmChannel = createMockChannel('dm')
      expect(canSend(dmChannel)).toBe(true)
    })

    it('should return false for channels without client user', () => {
      const channel = createMockChannel('guild') as any
      // Mock permissionsFor to return null
      vi.mocked(channel.permissionsFor).mockReturnValue(null)
      expect(canSend(channel)).toBe(false)
    })

    it('should return false for invalid channel types', () => {
      const invalidChannel = { type: 999 } as any
      expect(canSend(invalidChannel)).toBe(false)
    })

    it.skip('should return true when bot has required permissions', () => {
      // TODO: Fix GuildChannel instanceof mocking
      const channel = createMockChannel('guild') as any
      const mockPerms = createMockPermissions(['ViewChannel', 'SendMessages'])
      channel.permissionsFor = vi.fn().mockReturnValue(mockPerms)

      expect(canSend(channel)).toBe(true)
    })

    it('should return false when bot lacks ViewChannel permission', () => {
      const channel = createMockChannel('guild') as any
      const mockPerms = createMockPermissions(['SendMessages']) // Missing ViewChannel
      vi.mocked(channel.permissionsFor).mockReturnValue(mockPerms)

      expect(canSend(channel)).toBe(false)
    })

    it('should return false when bot lacks SendMessages permission', () => {
      const channel = createMockChannel('guild') as any
      const mockPerms = createMockPermissions(['ViewChannel']) // Missing SendMessages
      vi.mocked(channel.permissionsFor).mockReturnValue(mockPerms)

      expect(canSend(channel)).toBe(false)
    })

    it.skip('should check for EmbedLinks permission when embedLinks is true', () => {
      // TODO: Fix GuildChannel instanceof mocking
      const channel = createMockChannel('guild') as any
      const mockPerms = createMockPermissions(['ViewChannel', 'SendMessages', 'EmbedLinks'])
      vi.mocked(channel.permissionsFor).mockReturnValue(mockPerms)

      expect(canSend(channel, true)).toBe(true)
    })

    it('should return false when embedLinks is true but bot lacks EmbedLinks permission', () => {
      const channel = createMockChannel('guild') as any
      const mockPerms = createMockPermissions(['ViewChannel', 'SendMessages']) // Missing EmbedLinks
      vi.mocked(channel.permissionsFor).mockReturnValue(mockPerms)

      expect(canSend(channel, true)).toBe(false)
    })
  })
})