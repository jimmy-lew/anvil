import type {
  Attachment,
  BaseMessageOptions,
  Collection,
  Message,
  MessageMentions,
  PartialMessage,
  TextBasedChannel,
  User,
} from 'discord.js'
import {
  CommandInteraction,
  RESTJSONErrorCodes as DiscordApiErrors,
  EmbedBuilder,
  MessageFlags,
  PartialGroupDMChannel,
} from 'discord.js'

const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.MaximumNumberOfPinsReachedForTheChannel,
  DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
  DiscordApiErrors.MaximumActiveThreads,
]

function _parseContent(content: string | EmbedBuilder | BaseMessageOptions): BaseMessageOptions {
  let opts: BaseMessageOptions
  if (typeof content == 'string')
    opts = { content }
  else if (content instanceof EmbedBuilder)
    opts = { embeds: [content] }
  else opts = content
  return opts
}

export async function sendMessage(
  target: User | TextBasedChannel,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay?: number,
  hidden?: boolean,
): Promise<any>
export async function sendMessage(
  target: CommandInteraction,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay?: number,
  hidden?: boolean,
): Promise<any>
export async function sendMessage(
  target: User | TextBasedChannel | CommandInteraction,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay: number = 0,
  hidden: boolean = false,
): Promise<any> {
  if (target instanceof PartialGroupDMChannel)
    return
  const opts = _parseContent(content)
  if (target instanceof CommandInteraction) {
    const is_deferred = target.deferred || target.replied
    const res = is_deferred
      ? await target.followUp({ ...opts, flags: hidden ? MessageFlags.Ephemeral : undefined })
      : await target.reply({ ...opts, flags: hidden ? MessageFlags.Ephemeral : undefined })
    return is_deferred ? res : (await target.fetchReply())
  }
  return setTimeout(async () => await target.send(opts), delay)
}

function _parseMentions(mentions: MessageMentions) {
  if (!mentions)
    return 'NULL'
  if (mentions.everyone)
    return '@everyone'
  return 'NULL'
}

function _parseAttachments(attachments: Collection<string, Attachment>) {
  if (!attachments)
    return 'NULL'
  if (attachments.size > 0)
    return attachments.map(a => a.url).join(', ')
  return 'NULL'
}

export async function parseMsg(raw: Message | PartialMessage) {
  let msg = raw
  let mentions = ''
  let attachments = ''
  try {
    msg = raw.partial ? (await raw.fetch()) : raw as Message
    mentions = _parseMentions(msg.mentions)
    attachments = _parseAttachments(msg.attachments)
  }
  catch (err) { }
  return {
    channel: msg.channelId,
    msg_id: msg.id,
    author_id: msg.author?.id,
    username: msg.author?.username,
    content: msg.content,
    mentions,
    attachments,
    created: msg.createdTimestamp,
    edited: msg.editedTimestamp ?? 0,
  }
}
