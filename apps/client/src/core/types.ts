/**
 * Shared type definitions for the Discord bot
 * Centralized type definitions to ensure consistency across the codebase
 */

import type { Client, GatewayIntentBits, Message, ChatInputCommandInteraction } from "discord.js";

/**
 * Bot configuration types derived from config.yaml and environment variables
 */
export interface BotConfig {
  prefix: string;
  testGuildId: string;
  logLevel: "debug" | "info" | "warn" | "error";
  features: FeatureFlags;
  database: DatabaseConfig;
  redis: RedisConfig;
  performance: PerformanceConfig;
  rateLimit: RateLimitConfig;
}

export interface FeatureFlags {
  messageLogging: boolean;
  commandCooldowns: boolean;
  errorReporting: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  pool: {
    min: number;
    max: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  keyPrefix: string;
}

export interface PerformanceConfig {
  messageCacheMaxSize: number;
  messageCacheLifetime: number;
  commandHandling: CommandHandlingConfig;
}

export interface CommandHandlingConfig {
  concurrency: number;
  cooldown: {
    default: number;
    premium: number;
  };
}

export interface RateLimitConfig {
  global: RateLimitWindow;
  webhook: RateLimitWindow;
}

export interface RateLimitWindow {
  maxRequests: number;
  windowMs: number;
}

/**
 * Discord client options
 */
export interface DiscordClientOptions {
  intents: GatewayIntentBits[];
  partials?: string[];
}

/**
 * Command type definition
 * Represents a slash command or prefix command
 */
export interface Command {
  /** Command name (without prefix for prefix commands) */
  name: string;
  /** Command description for help */
  description: string;
  /** Whether the command is only available in guilds */
  guildOnly?: boolean;
  /** Whether the command is owner-only */
  ownerOnly?: boolean;
  /** Required permissions for the user */
  userPermissions?: string[];
  /** Cooldown in milliseconds */
  cooldown?: number;
  /** Subcommands or subcommand groups (for slash commands) */
  options?: CommandOption[];
}

export interface CommandOption {
  type: "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable" | "number";
  name: string;
  description: string;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: CommandOption[];
}

/**
 * Event handler type definition
 */
export interface EventHandler<T = unknown> {
  /** Event name (e.g., 'messageCreate', 'interactionCreate') */
  event: string;
  /** Whether the handler should only run once */
  once?: boolean;
  /** The handler function */
  execute: (data: T) => void;
}

/**
 * Context types for different event handlers
 */
export type MessageContext = {
  message: Message;
  args: string[];
  command: string | null;
};

export type InteractionContext = {
  interaction: ChatInputCommandInteraction;
  commandName: string;
  options: Map<string, unknown>;
};

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = 
  | { readonly _tag: "Right"; readonly right: T }
  | { readonly _tag: "Left"; readonly left: E };

/**
 * Type narrowing helpers for Result type
 */
export const isRight = <T, E>(result: Result<T, E>): result is { _tag: "Right"; right: T } =>
  result._tag === "Right";

export const isLeft = <T, E>(result: Result<T, E>): result is { _tag: "Left"; left: E } =>
  result._tag === "Left";

/**
 * Environment variable types
 */
export interface EnvVars {
  BOT_TOKEN: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  CLIENT_ID?: string;
  GUILD_ID?: string;
  LOG_LEVEL?: string;
  NODE_ENV?: string;
}

/**
 * Application state interface
 */
export interface AppState {
  client: Client;
  config: BotConfig;
  isReady: boolean;
}

/**
 * Dependency injection container type
 */
export interface Deps {
  client: Client;
  config: BotConfig;
}
