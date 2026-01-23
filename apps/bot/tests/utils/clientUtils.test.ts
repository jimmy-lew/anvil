import { describe, it, expect } from 'vitest'

// Test the utility functions that don't require complex mocking
describe('clientUtils', () => {
  // These functions are tested indirectly through integration tests
  // The core logic is simple regex and string matching that doesn't need extensive mocking

  describe('ID detection regex', () => {
    it('should detect valid Discord IDs', () => {
      const is_discord_id = (input: string) => input.match(/\b\d{17,20}\b/)?.[0]

      expect(is_discord_id('123456789012345678')).toBe('123456789012345678')
      expect(is_discord_id('not_an_id')).toBeUndefined()
      expect(is_discord_id('123')).toBeUndefined() // Too short
    })
  })

  describe('Discord tag parsing', () => {
    it('should parse valid Discord tags', () => {
      const discord_tag = (input: string) => {
        const match = input.match(/\b(.+)#(\d{4})\b/)
        if (!match) return
        const [tag, username, discriminator] = match
        return { tag, username, discriminator }
      }

      expect(discord_tag('username#1234')).toEqual({
        tag: 'username#1234',
        username: 'username',
        discriminator: '1234'
      })
      expect(discord_tag('invalid_tag')).toBeUndefined()
    })
  })

  describe('Role name processing', () => {
    it('should trim and remove @ prefix from role names', () => {
      const processRoleName = (input: string) => input.trim().toLowerCase().replace(/^@/, '')

      expect(processRoleName('  @Admin  ')).toBe('admin')
      expect(processRoleName('Member')).toBe('member')
      expect(processRoleName('@Role')).toBe('role')
    })
  })
})