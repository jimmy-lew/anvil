import type { BaseMessageOptions, Channel, TextBasedChannel, User } from 'discord.js'
import {
  CommandInteraction,
  DMChannel,
  EmbedBuilder,
  GuildChannel,
  MessageFlags,
  PartialGroupDMChannel,
  PermissionFlagsBits,
  ThreadChannel,
} from 'discord.js'

type ContentTypes = string | EmbedBuilder | BaseMessageOptions

function contentToOpts(content: ContentTypes): BaseMessageOptions {
  let opts: BaseMessageOptions
  if (typeof content == 'string')
    opts = { content }
  else if (content instanceof EmbedBuilder)
    opts = { embeds: [content] }
  else opts = content
  return opts
}

export async function send(
  target: User | TextBasedChannel,
  content: ContentTypes,
  delay?: number,
  hidden?: boolean,
): Promise<any>
export async function send(
  target: CommandInteraction,
  content: ContentTypes,
  delay?: number,
  hidden?: boolean,
): Promise<any>
export async function send(
  target: User | TextBasedChannel | CommandInteraction,
  content: ContentTypes,
  delay: number = 0,
  hidden: boolean = false,
): Promise<any> {
  if (target instanceof PartialGroupDMChannel)
    return
  const opts = contentToOpts(content)
  if (!(target instanceof CommandInteraction)) {
    return setTimeout(() => target.send(opts), delay)
  }
  const isDeferred = target.deferred || target.replied
  const res = isDeferred
    ? target.followUp({ ...opts, flags: hidden ? MessageFlags.Ephemeral : undefined })
    : target.reply({ ...opts, flags: hidden ? MessageFlags.Ephemeral : undefined })
  return isDeferred ? res : target.fetchReply()
}

export function canSend(channel: Channel, embedLinks: boolean = false) {
  if (channel instanceof DMChannel)
    return true
  if (!(channel instanceof GuildChannel) && !(channel instanceof ThreadChannel))
    return false
  const channel_perms = channel.permissionsFor(channel.client.user)
  if (!channel_perms)
    return false
  const embed_perms = embedLinks ? [PermissionFlagsBits.EmbedLinks] : []
  return channel_perms.has([
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    ...embed_perms,
  ])
}
