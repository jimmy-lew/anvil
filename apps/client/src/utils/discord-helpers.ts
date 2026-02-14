/**
 * Pure Discord.js Helper Functions
 * 
 * These functions are pure - they don't perform side effects themselves
 * but return IO actions that can be composed and executed later
 */

import {
  EmbedBuilder,
  TextChannel,
  type Message,
  type ChatInputCommandInteraction,
  RESTJSONErrorCodes,
} from "discord.js";

/**
 * Check if a message mentions the bot
 */
export const mentionsBot = (message: Message, botId: string): boolean => 
  message.mentions.users.has(botId);

/**
 * Extract command name from a message content
 */
export const extractCommand = (
  content: string,
  prefix: string
): string | null => {
  if (!content.startsWith(prefix)) return null;
  const args = content.slice(prefix.length).trim().split(/\s+/);
  return args[0]?.toLowerCase() ?? null;
};

/**
 * Extract arguments from message content
 */
export const extractArgs = (
  content: string,
  prefix: string
): string[] => {
  const args = content.slice(prefix.length).trim().split(/\s+/);
  return args.slice(1);
};

/**
 * Create a simple embed builder
 */
export const createEmbed = (): EmbedBuilder => 
  new EmbedBuilder();

/**
 * Create a success embed
 */
export const createSuccessEmbed = (title: string, description: string): EmbedBuilder => 
  new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(title)
    .setDescription(description);

/**
 * Create an error embed
 */
export const createErrorEmbed = (title: string, description: string): EmbedBuilder => 
  new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(title)
    .setDescription(description);

/**
 * Create an info embed
 */
export const createInfoEmbed = (title: string, description: string): EmbedBuilder => 
  new EmbedBuilder()
    .setColor(0x0000ff)
    .setTitle(title)
    .setDescription(description);

/**
 * Parse slash command options
 */
export const parseCommandOptions = (
  interaction: ChatInputCommandInteraction
): Map<string, unknown> => {
  const options = new Map<string, unknown>();
  if (!interaction.options) return options;
  
  for (const option of interaction.options.data) {
    if (option.value !== undefined) {
      options.set(option.name, option.value);
    }
  }
  return options;
};

/**
 * Get a command option value with type safety
 */
export const getCommandOption = <T>(
  interaction: ChatInputCommandInteraction,
  name: string
): T | null => {
  const option = interaction.options?.get(name);
  return option?.value as T ?? null;
};

/**
 * Check if a channel is text-based
 */
export const isTextChannel = (channel: unknown): channel is TextChannel => {
  return channel instanceof TextChannel;
};

/**
 * Check if a user is mentioned in a message
 */
export const isUserMentioned = (message: Message, userId: string): boolean => 
  message.mentions.users.has(userId);

/**
 * Check if a role is mentioned in a message
 */
export const isRoleMentioned = (message: Message, roleId: string): boolean => 
  message.mentions.roles.has(roleId);

/**
 * Clean up message content (remove mentions, etc.)
 */
export const cleanContent = (message: Message, content: string): string => {
  return content
    .replace(/@everyone/g, "@\u200Beveryone")
    .replace(/@here/g, "@\u200Bhere")
    .replace(/<@!?(\d+)>/g, (_, id) => {
      const user = message.client.users.cache.get(id);
      return user ? `@${user.username}` : "@unknown";
    })
    .replace(/<@&(\d+)>/g, (_, id) => {
      const role = message.guild?.roles.cache.get(id);
      return role ? `@${role.name}` : "@unknown";
    });
};

/**
 * Format a duration in milliseconds to human-readable string
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Truncate a string to specified length
 */
export const truncate = (str: string, length: number, suffix = "..."): string => {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
};

/**
 * Check if an error is a Discord API error
 */
export const isDiscordAPIError = (error: unknown): error is { code: number; message: string } => {
  if (typeof error !== "object" || error === null) return false;
  return "code" in error && "message" in error;
};

/**
 * Check if error is due to missing permissions
 */
export const isMissingPermissionsError = (error: unknown): boolean => {
  if (!isDiscordAPIError(error)) return false;
  return error.code === RESTJSONErrorCodes.MissingPermissions;
};

/**
 * Check if error is due to missing access
 */
export const isMissingAccessError = (error: unknown): boolean => {
  if (!isDiscordAPIError(error)) return false;
  return error.code === RESTJSONErrorCodes.MissingAccess;
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => 
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Convert array to comma-separated string
 */
export const toCommaSeparated = (items: string[]): string => 
  items.join(", ");

/**
 * Get random item from array
 */
export const randomFromArray = <T>(array: readonly T[]): T | undefined => 
  array.length > 0 ? array[Math.floor(Math.random() * array.length)] : undefined;

/**
 * Shuffle an array (returns new array)
 */
export const shuffleArray = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
};

/**
 * Debounce a function (pure version, returns new function)
 */
export const debounce = <A extends (...args: Parameters<A>) => void>(
  f: A,
  delay: number
): ((...args: Parameters<A>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<A>): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => f(...args), delay);
  };
};

/**
 * Sleep for specified milliseconds (pure, returns promise)
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) throw error;
      retries++;
      const delay = baseDelay * Math.pow(2, retries - 1);
      await sleep(delay);
    }
  }
};
