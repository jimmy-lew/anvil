/**
 * Logging Effects
 * 
 * Wraps all logging side effects in IO monads
 * This allows us to compose logging operations without executing them
 * until explicitly run
 */

import type { IO } from "../io/io.js";

/**
 * Log levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Current log level (default: info)
 */
let currentLogLevel: LogLevel = "info";

/**
 * Set the log level
 */
export const setLogLevel = (level: LogLevel): IO<void> => 
  () => {
    currentLogLevel = level;
  };

/**
 * Get the current log level
 */
export const getLogLevel = (): IO<LogLevel> => 
  () => currentLogLevel;

/**
 * Log a debug message
 */
export const debug = (message: string, _data?: unknown): IO<void> => 
  () => {
    if (currentLogLevel === "debug") {
      console.log(`[DEBUG] ${message}`);
    }
  };

/**
 * Log an info message
 */
export const info = (message: string, _data?: unknown): IO<void> => 
  () => {
    if (currentLogLevel === "debug" || currentLogLevel === "info") {
      console.log(`[INFO] ${message}`);
    }
  };

/**
 * Log a warning message
 */
export const warn = (message: string, data?: unknown): IO<void> => 
  () => {
    if (currentLogLevel !== "error") {
      console.warn(`[WARN] ${message}`, data ?? "");
    }
  };

/**
 * Log an error message
 */
export const error = (message: string, error?: unknown): IO<void> => 
  () => {
    console.error(`[ERROR] ${message}`, error ?? "");
  };

/**
 * Log a command usage
 */
export const logCommand = (
  command: string,
  userId: string,
  guildId?: string
): IO<void> => 
  () => {
    const guildInfo = guildId ? ` in guild ${guildId}` : " in DM";
    console.log(`[COMMAND] ${command} by user ${userId}${guildInfo}`);
  };

/**
 * Log an interaction
 */
export const logInteraction = (
  interactionType: string,
  commandName?: string
): IO<void> => 
  () => {
    const commandInfo = commandName ? ` (${commandName})` : "";
    console.log(`[INTERACTION] ${interactionType}${commandInfo}`);
  };

/**
 * Log a message event
 */
export const logMessage = (
  action: "sent" | "deleted" | "edited",
  messageId: string,
  channelId: string
): IO<void> => 
  () => {
    console.log(`[MESSAGE] ${action}: ${messageId} in ${channelId}`);
  };

/**
 * Log a guild event
 */
export const logGuild = (
  action: "joined" | "left",
  guildId: string,
  guildName?: string
): IO<void> => 
  () => {
    const nameInfo = guildName ? ` (${guildName})` : "";
    console.log(`[GUILD] ${action} guild ${guildId}${nameInfo}`);
  };

/**
 * Log a startup event
 */
export const logStartup = (): IO<void> => 
  () => {
    console.log("[STARTUP] Bot is starting up...");
  };

/**
 * Log a ready event
 */
export const logReady = (): IO<void> => 
  () => {
    console.log("[READY] Bot is ready!");
  };

/**
 * Log a shutdown event
 */
export const logShutdown = (): IO<void> => 
  () => {
    console.log("[SHUTDOWN] Bot is shutting down...");
  };

/**
 * Log performance metrics
 */
export const logPerformance = (
  operation: string,
  duration: number
): IO<void> => 
  () => {
    console.log(`[PERF] ${operation} completed in ${duration.toFixed(2)}ms`);
  };

/**
 * Log an API call
 */
export const logAPICall = (
  method: string,
  endpoint: string,
  status?: number
): IO<void> => 
  () => {
    const statusInfo = status ? ` (${status})` : "";
    console.log(`[API] ${method} ${endpoint}${statusInfo}`);
  };

/**
 * Log a rate limit event
 */
export const logRateLimit = (
  endpoint: string,
  retryAfter: number
): IO<void> => 
  () => {
    console.log(`[RATE LIMIT] ${endpoint} - retry after ${retryAfter}ms`);
  };

/**
 * Create a logger with a specific prefix
 */
export const createLogger = (prefix: string): {
  debug: (message: string, data?: unknown) => IO<void>;
  info: (message: string, data?: unknown) => IO<void>;
  warn: (message: string, data?: unknown) => IO<void>;
  error: (message: string, err?: unknown) => IO<void>;
} => ({
  debug: (message: string, data?: unknown) => debug(`[${prefix}] ${message}`, data),
  info: (message: string, data?: unknown) => info(`[${prefix}] ${message}`, data),
  warn: (message: string, data?: unknown) => warn(`[${prefix}] ${message}`, data),
  error: (message: string, err?: unknown) => error(`[${prefix}] ${message}`, err),
});
