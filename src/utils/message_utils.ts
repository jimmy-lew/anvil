import {
  BaseMessageOptions,
  CommandInteraction,
  EmojiResolvable,
  Message,
  MessageEditOptions,
  MessageMentions,
  MessageReaction,
  PartialMessage,
  StartThreadOptions,
  TextBasedChannel,
  ThreadChannel,
  User,
} from 'discord.js'
import {
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  EmbedBuilder,
  MessageFlags,
  PartialGroupDMChannel,
} from 'discord.js'
import { logger } from '../logger'

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

const _handle_disc_api_error = (error: DiscordAPIError) => {
  if (!(typeof error.code == 'number')) return
  if (IGNORED_ERRORS.includes(error.code)) return
}

const _parse_content_to_opts = (content: string | EmbedBuilder | BaseMessageOptions): BaseMessageOptions => {
  let opts: BaseMessageOptions
  if (typeof content == 'string') opts = {content}
  else if (content instanceof EmbedBuilder) opts = {embeds: [content]}
  else opts = content 
  return opts
}

export async function send_message(
  target: User | TextBasedChannel,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay?: number,
  hidden?: boolean
): Promise<any>
export async function send_message(
  target: CommandInteraction,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay?: number,
  hidden?: boolean
): Promise<any>
export async function send_message(
  target: User | TextBasedChannel | CommandInteraction,
  content: string | EmbedBuilder | BaseMessageOptions,
  delay: number = 0,
  hidden: boolean = false
): Promise<any> {
  if (target instanceof PartialGroupDMChannel) return
  const opts = _parse_content_to_opts(content)
  if (target instanceof CommandInteraction) {
    const is_deferred = target.deferred || target.replied
    const res = is_deferred
      ? await target.followUp({...opts, flags: hidden ? MessageFlags.Ephemeral : undefined})
      : await target.reply({...opts, flags: hidden ? MessageFlags.Ephemeral : undefined})
    return is_deferred ? res : (await target.fetchReply())
  }
  return setTimeout(async () => await target.send(opts), delay)
}

const _parse_mentions = (mentions: MessageMentions) => {
  if (!mentions) return 'NULL'
  if (mentions.everyone) return '@everyone'
  return 'NULL'
}

export const parse_message_object = async (raw: Message | PartialMessage) => {
  let msg = raw
  let mentions = ''
  try {
    msg = raw.partial ? (await raw.fetch()) : raw as Message
    mentions = _parse_mentions(msg.mentions)
  }
  catch (err){ }
  return {
    channel: msg.channelId,
    msg_id: msg.id,
    author_id: msg.author?.id,
    author_username: msg.author?.username,
    content: msg.content,
    mentions,
    created: msg.createdTimestamp,
    edited: msg.editedTimestamp ?? 0
  }
}

export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | EmbedBuilder | BaseMessageOptions,
  ): Promise<Message> {
    if (target instanceof PartialGroupDMChannel)
      return
    try {
      const options: BaseMessageOptions
        = typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      return await target.send(options)
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async reply(
    msg: Message,
    content: string | EmbedBuilder | BaseMessageOptions,
  ): Promise<Message> {
    try {
      const options: BaseMessageOptions
        = typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      return await msg.reply(options)
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async edit(
    msg: Message,
    content: string | EmbedBuilder | MessageEditOptions,
  ): Promise<Message> {
    try {
      const options: MessageEditOptions
        = typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      return await msg.edit(options)
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async react(msg: Message, emoji: EmojiResolvable): Promise<MessageReaction> {
    try {
      return await msg.react(emoji)
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async pin(msg: Message, pinned: boolean = true): Promise<Message> {
    try {
      return pinned ? await msg.pin() : await msg.unpin()
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async startThread(
    msg: Message,
    options: StartThreadOptions,
  ): Promise<ThreadChannel> {
    try {
      return await msg.startThread(options)
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }

  public static async delete(msg: Message): Promise<Message> {
    try {
      return await msg.delete()
    }
    catch (error) {
      if (
        error instanceof DiscordAPIError
        && typeof error.code == 'number'
        && IGNORED_ERRORS.includes(error.code)
      ) {

      }
      else {
        throw error
      }
    }
  }
}
