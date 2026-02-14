/**
 * Event Handlers
 * 
 * Pure functions that handle Discord events
 * Each handler returns an IO action
 */

import type { Message, Guild } from "discord.js";
import type { IO } from "@/io";
import type { BotConfig } from "@/core";
import { logMessage, logGuild, logReady, logAPICall } from "@/effects";

/**
 * Handler for the ready event
 * Called when the bot is connected and ready
 */
export const handleReady = (_client: { user?: { username: string } }): IO<void> => {
  const log = logReady();
  const logBotInfo = (): void => {
    const username = _client.user?.username ?? "Unknown";
    console.log(`[READY] Bot logged in as ${username}`);
  };
  
  return () => {
    log();
    logBotInfo();
  };
};

/**
 * Handler for message create event
 * Logs message activity
 */
export const handleMessageCreate = (
  message: Message,
  _config: BotConfig
): IO<void> => {
  const log = logMessage("sent", message.id, message.channelId);
  
  // Ignore bot messages
  if (message.author.bot) {
    return () => {};
  }
  
  return () => {
    log();
  };
};

/**
 * Handler for message delete event
 * Logs deleted messages
 */
export const handleMessageDelete = (
  message: Message,
  _config: BotConfig
): IO<void> => {
  const log = logMessage("deleted", message.id, message.channelId);
  
  return () => {
    log();
  };
};

/**
 * Handler for guild create event
 * Called when bot joins a new guild
 */
export const handleGuildCreate = (
  guild: Guild,
  _config: BotConfig
): IO<void> => {
  const log = logGuild("joined", guild.id, guild.name);
  const guildInfo = (): void => {
    console.log(`[GUILD] Joined guild: ${guild.name} (${guild.id})`);
    console.log(`[GUILD] Members: ${guild.memberCount}`);
  };
  
  return () => {
    log();
    guildInfo();
  };
};

/**
 * Handler for guild delete event
 * Called when bot leaves a guild
 */
export const handleGuildDelete = (
  guild: Guild,
  _config: BotConfig
): IO<void> => {
  const log = logGuild("left", guild.id, guild.name);
  
  return () => {
    log();
  };
};

/**
 * Handler for error events
 * Logs Discord API errors
 */
export const handleError = (
  error: Error,
  _context?: string
): IO<void> => {
  const contextInfo = _context ? ` in ${_context}` : "";
  const logError = (): void => {
    console.error(`[ERROR] Discord API error${contextInfo}:`, error);
  };
  
  return () => {
    logError();
  };
};

/**
 * Handler for warn events
 * Logs warnings from Discord.js
 */
export const handleWarn = (
  message: string,
  _context?: string
): IO<void> => {
  const contextInfo = _context ? ` in ${_context}` : "";
  const logWarn = (): void => {
    console.warn(`[WARN]${contextInfo}:`, message);
  };
  
  return () => {
    logWarn();
  };
};

/**
 * Handler for invalid request warnings
 */
export const handleInvalidRequest = (
  info: { code: number; message: string },
  _context?: string
): IO<void> => {
  const contextInfo = _context ? ` in ${_context}` : "";
  const logAPI = logAPICall("INVALID", `Request ${info.code}`, info.code);
  
  return () => {
    logAPI();
    console.warn(`[WARN] Invalid request${contextInfo}:`, info.message);
  };
};

/**
 * Handler for shard reconnecting
 */
export const handleShardReconnecting = (
  shardId: number
): IO<void> => {
  return () => {
    console.log(`[SHARD] Shard ${shardId} is reconnecting...`);
  };
};

/**
 * Handler for shard resume
 */
export const handleShardResume = (
  shardId: number
): IO<void> => {
  return () => {
    console.log(`[SHARD] Shard ${shardId} resumed connection`);
  };
};

/**
 * Handler for interaction rate limit
 */
export const handleRateLimit = (
  rateLimitInfo: {
    timeout: number;
    limit: number;
    method: string;
    path: string;
  }
): IO<void> => {
  const logRateLimit = (): void => {
    console.log(
      `[RATE LIMIT] ${rateLimitInfo.method} ${rateLimitInfo.path} ` +
      `(limit: ${rateLimitInfo.limit}, timeout: ${rateLimitInfo.timeout}ms)`
    );
  };
  
  return () => {
    logRateLimit();
  };
};
