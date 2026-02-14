/**
 * Discord API Effects
 * 
 * Wraps all Discord API side effects in IO monads
 * This allows us to compose Discord operations without executing them
 * until explicitly run
 */

import {
  type ChatInputCommandInteraction,
  type Message,
  type TextChannel,
  Colors,
  EmbedBuilder,
} from "discord.js";
import type { IO } from "@/io";

/**
 * Send a message to a channel
 */
export const sendMessage = (
  channel: TextChannel,
  content: string
): IO<unknown> => 
  () => channel.send(content).catch(() => null);

/**
 * Send an embed to a channel
 */
export const sendEmbed = (
  channel: TextChannel,
  embed: EmbedBuilder
): IO<unknown> => 
  () => channel.send({ embeds: [embed] }).catch(() => null);

/**
 * Reply to an interaction
 */
export const replyToInteraction = (
  interaction: ChatInputCommandInteraction,
  content: string,
  ephemeral: boolean = false
): IO<unknown> => 
  () => interaction.reply({ content, ephemeral }).catch(() => null);

/**
 * Reply to an interaction with an embed
 */
export const replyWithEmbed = (
  interaction: ChatInputCommandInteraction,
  embed: EmbedBuilder,
  ephemeral: boolean = false
): IO<unknown> => 
  () => interaction.reply({ embeds: [embed], ephemeral }).catch(() => null);

/**
 * Defer an interaction (for longer-running commands)
 */
export const deferInteraction = (
  interaction: ChatInputCommandInteraction,
  ephemeral: boolean = false
): IO<unknown> => 
  () => interaction.deferReply({ ephemeral }).catch(() => null);

/**
 * Edit an interaction reply
 */
export const editInteractionReply = (
  interaction: ChatInputCommandInteraction,
  content: string
): IO<unknown> => 
  () => interaction.editReply(content).catch(() => null);

/**
 * Follow up an interaction after deferral
 */
export const followUpInteraction = (
  interaction: ChatInputCommandInteraction,
  content: string,
  ephemeral: boolean = false
): IO<unknown> => 
  () => interaction.followUp({ content, ephemeral }).catch(() => null);

/**
 * Delete a message
 */
export const deleteMessage = (
  message: Message
): IO<unknown> => 
  () => message.delete().catch(() => null);

/**
 * Create a simple embed
 */
export const createSimpleEmbed = (
  title: string,
  description: string,
  color: number = Colors.Blurple
): EmbedBuilder => 
  new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

/**
 * Create a success embed (green)
 */
export const createSuccessEmbed = (
  title: string,
  description: string
): EmbedBuilder => 
  new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(Colors.Green);

/**
 * Create an error embed (red)
 */
export const createErrorEmbed = (
  title: string,
  description: string
): EmbedBuilder => 
  new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(Colors.Red);

/**
 * Create an info embed (blue)
 */
export const createInfoEmbed = (
  title: string,
  description: string
): EmbedBuilder => 
  new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(Colors.Blue);

/**
 * Send a direct message to a user
 */
export const sendDM = (
  user: { send: (content: string) => Promise<Message> },
  content: string
): IO<unknown> => 
  () => user.send(content).catch(() => null);

/**
 * Delete a channel
 */
export const deleteChannel = (
  channel: { delete: () => Promise<void> }
): IO<unknown> => 
  () => channel.delete().catch(() => null);

/**
 * Add a reaction to a message
 */
export const addReaction = (
  message: Message,
  emoji: string
): IO<unknown> => 
  () => message.react(emoji).catch(() => null);
