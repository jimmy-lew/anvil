import type { Channel } from 'discord.js'
import { DMChannel, GuildChannel, PermissionFlagsBits, ThreadChannel } from 'discord.js'

export const canSend = (channel: Channel, embedLinks: boolean = false) => {
  if (channel instanceof DMChannel) return true
  if (!(channel instanceof GuildChannel) && !(channel instanceof ThreadChannel)) return false
  const channel_perms = channel.permissionsFor(channel.client.user)
  if (!channel_perms) return false
  const embed_perms = embedLinks ? [PermissionFlagsBits.EmbedLinks] : []
  return channel_perms.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    ...embed_perms
  ])
}
