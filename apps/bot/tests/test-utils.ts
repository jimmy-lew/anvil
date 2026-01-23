import type { ChatInputCommandInteraction, User, Channel, PermissionsBitField, Guild, Role, Message } from 'discord.js'
import { PermissionFlagsBits } from 'discord.js'
import { vi } from 'vitest'

// Mock Discord.js entities
export const createMockUser = (id: string = '123456789', username: string = 'testuser'): User => ({
  id,
  username,
  discriminator: '0000',
  tag: `${username}#0000`,
  bot: false,
  system: false,
  flags: null,
  createdTimestamp: Date.now(),
  createdAt: new Date(),
  displayName: username,
  globalName: username,
  avatar: null,
  banner: null,
  accentColor: null,
  hexAccentColor: null,
  defaultAvatarURL: '',
  avatarURL: vi.fn(),
  displayAvatarURL: vi.fn(),
  toString: vi.fn(() => `<@${id}>`),
} as any)

export const createMockPermissions = (allowed: (keyof typeof PermissionFlagsBits)[] = []): PermissionsBitField => ({
  has: vi.fn((perms) => {
    const permsArray = Array.isArray(perms) ? perms : [perms]
    return permsArray.every((perm: any) => {
      // Handle PermissionFlagsBits enum values (bigint)
      if (typeof perm === 'bigint') {
        // Find the permission name for this bigint value
        const permName = Object.keys(PermissionFlagsBits).find(
          key => PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] === perm
        )
        return permName ? allowed.includes(permName as keyof typeof PermissionFlagsBits) : false
      }
      // Handle string keys
      if (typeof perm === 'string') {
        return allowed.includes(perm as keyof typeof PermissionFlagsBits)
      }
      return false
    })
  }),
  toArray: vi.fn(() => allowed),
} as any)

export const createMockChannel = (type: 'guild' | 'dm' | 'thread' = 'guild', id: string = '987654321'): Channel => {
  const baseChannel = {
    id,
    type: type === 'dm' ? 1 : type === 'thread' ? 11 : 0,
    createdTimestamp: Date.now(),
    createdAt: new Date(),
  }

  if (type === 'dm') {
    return {
      ...baseChannel,
      recipient: createMockUser(),
      // Add DMChannel-specific properties
      constructor: { name: 'DMChannel' },
    } as any
  }

  return {
    ...baseChannel,
    permissionsFor: vi.fn(() => createMockPermissions(['ViewChannel', 'SendMessages'])),
    client: { user: createMockUser('bot123') },
  } as any
}

export const createMockGuild = (id: string = 'guild123'): Guild => ({
  id,
  name: 'Test Guild',
  members: {
    fetch: vi.fn(async (idOrOptions) => {
      if (typeof idOrOptions === 'string') {
        return createMockGuildMember(idOrOptions)
      }
      return new Map([['user123', createMockGuildMember('user123')]])
    }),
  },
  roles: {
    fetch: vi.fn(async () => new Map([
      ['role1', createMockRole('role1', 'Admin')],
      ['role2', createMockRole('role2', 'Member')],
    ])),
  },
} as any)

export const createMockGuildMember = (userId: string) => ({
  id: userId,
  user: createMockUser(userId),
  roles: {
    cache: new Map(),
  },
})

export const createMockRole = (id: string, name: string): Role => ({
  id,
  name,
  color: 0,
  hoist: false,
  position: 1,
  permissions: createMockPermissions(),
  managed: false,
  mentionable: true,
  createdTimestamp: Date.now(),
  createdAt: new Date(),
} as any)

export const createMockMessage = (content: string = 'test message', authorId: string = 'user123'): Message => ({
  id: 'msg123',
  content,
  author: createMockUser(authorId),
  channel: createMockChannel('guild'),
  channelId: '987654321',
  guildId: 'guild123',
  member: createMockGuildMember(authorId),
  createdTimestamp: Date.now(),
  editedTimestamp: null,
  type: 0,
  system: false,
  pinned: false,
  tts: false,
  nonce: null,
  embeds: [],
  attachments: new Map(),
  stickers: new Map(),
  position: null,
  webhookId: null,
  applicationId: null,
  activity: null,
  flags: null,
  reference: null,
  interaction: null,
  components: [],
  mentions: {
    everyone: false,
    users: new Map(),
    roles: new Map(),
    channels: new Map(),
  },
  partial: false,
  fetch: vi.fn(async function() { return this }),
} as any)

export const createMockInteraction = (commandName: string = 'test'): ChatInputCommandInteraction => ({
  id: 'interaction123',
  applicationId: 'app123',
  token: 'token123',
  version: 1,
  type: 2,
  user: createMockUser(),
  member: createMockGuildMember('user123'),
  channel: createMockChannel(),
  channelId: '987654321',
  guild: createMockGuild(),
  guildId: 'guild123',
  commandName,
  commandId: 'cmd123',
  options: {
    getString: vi.fn((name: string) => {
      if (name === 'option') return 'test_value'
      return null
    }),
    getInteger: vi.fn(),
    getBoolean: vi.fn(),
    getUser: vi.fn(),
    getChannel: vi.fn(),
    getRole: vi.fn(),
    getMentionable: vi.fn(),
    getNumber: vi.fn(),
    getAttachment: vi.fn(),
    getSubcommand: vi.fn(),
    getSubcommandGroup: vi.fn(),
  },
  replied: false,
  deferred: false,
  reply: vi.fn(),
  followUp: vi.fn(),
  editReply: vi.fn(),
  deferReply: vi.fn(),
  fetchReply: vi.fn(),
  deleteReply: vi.fn(),
  isChatInputCommand: vi.fn(() => true),
  isAutocomplete: vi.fn(() => false),
  isMessageContextMenu: vi.fn(() => false),
  isUserContextMenu: vi.fn(() => false),
  isButton: vi.fn(() => false),
  isStringSelectMenu: vi.fn(() => false),
  isUserSelectMenu: vi.fn(() => false),
  isRoleSelectMenu: vi.fn(() => false),
  isMentionableSelectMenu: vi.fn(() => false),
  isChannelSelectMenu: vi.fn(() => false),
  createdTimestamp: Date.now(),
  createdAt: new Date(),
} as any)

// Utility to create a mock command
export const createMockCommand = (name: string = 'test', perms: string[] = []) => ({
  defer: 'HIDDEN' as any, // Will be cast to CommandDeferType
  perms,
  metadata: { name },
  execute: vi.fn(),
})