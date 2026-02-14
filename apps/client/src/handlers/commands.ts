/**
 * Command Handlers
 * 
 * Pure functions that return IO monads
 * Each handler processes a command and returns an IO action
 */

import type { ChatInputCommandInteraction } from "discord.js";
import type { IO } from "@/io";
import type { BotConfig } from "@/core";
import { 
  replyToInteraction, 
  replyWithEmbed, 
  createSuccessEmbed, 
  createErrorEmbed 
} from "@/effects";
import { logCommand } from "@/effects";

/**
 * Handler for the ping command
 * Responds with "Pong!" and shows latency
 */
export const handlePing = (
  interaction: ChatInputCommandInteraction,
  _config: BotConfig
): IO<void> => {
  const log = logCommand("ping", interaction.user.id, interaction.guildId ?? undefined);
  const latency = interaction.client.ws.ping;
  const reply = replyToInteraction(
    interaction,
    `Pong! 🏓\nLatency: ${latency}ms`,
    false
  );
  
  return () => {
    log();
    reply();
  };
};

/**
 * Handler for the help command
 * Shows available commands
 */
export const handleHelp = (
  interaction: ChatInputCommandInteraction,
  config: BotConfig
): IO<void> => {
  const log = logCommand("help", interaction.user.id, interaction.guildId ?? undefined);
  
  const helpText = `
**Available Commands:**

• \`/ping\` - Check bot latency
• \`/help\` - Show this help message
• \`/info\` - Get bot information

**Prefix:** \`${config.prefix}\`
  `.trim();
  
  const embed = createSuccessEmbed("Help", helpText);
  const reply = replyWithEmbed(interaction, embed, false);
  
  return () => {
    log();
    reply();
  };
};

/**
 * Handler for the info command
 * Shows bot information
 */
export const handleInfo = (
  interaction: ChatInputCommandInteraction,
  _config: BotConfig
): IO<void> => {
  const log = logCommand("info", interaction.user.id, interaction.guildId ?? undefined);
  
  const client = interaction.client;
  const uptime = client.uptime ?? 0;
  const days = Math.floor(uptime / 86400000);
  const hours = Math.floor((uptime % 86400000) / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  
  const infoText = `
**Discord Bot**
Built with TypeScript, Discord.js, and RxJS

**Statistics:**
• Servers: ${client.guilds.cache.size}
• Users: ${client.users.cache.size}
• Uptime: ${days}d ${hours}h ${minutes}m

**Features:**
• Slash commands
• Command handling
• Event processing
• FRP architecture
  `.trim();
  
  const embed = createSuccessEmbed("Bot Information", infoText);
  const reply = replyWithEmbed(interaction, embed, false);
  
  return () => {
    log();
    reply();
  };
};

/**
 * Unknown command handler
 */
export const handleUnknown = (
  interaction: ChatInputCommandInteraction,
  _config: BotConfig
): IO<void> => {
  const commandName = interaction.commandName;
  const log = logCommand(`unknown:${commandName}`, interaction.user.id, interaction.guildId ?? undefined);
  
  const embed = createErrorEmbed(
    "Unknown Command",
    `The command \`/${commandName}\` is not recognized.`
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    log();
    reply();
  };
};

/**
 * Command error handler
 */
export const handleCommandError = (
  interaction: ChatInputCommandInteraction,
  error: unknown,
  commandName: string
): IO<void> => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const log = logCommand(`error:${commandName}`, interaction.user.id, interaction.guildId ?? undefined);
  
  console.error(`Command error in ${commandName}:`, error);
  
  const embed = createErrorEmbed(
    "Command Error",
    `An error occurred while executing \`/${commandName}\`:\n\`${errorMessage}\``
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    log();
    reply();
  };
};

/**
 * Command cooldown handler
 */
export const handleCooldown = (
  interaction: ChatInputCommandInteraction,
  commandName: string,
  remainingMs: number
): IO<void> => {
  const seconds = Math.ceil(remainingMs / 1000);
  
  const embed = createErrorEmbed(
    "Cooldown",
    `Please wait ${seconds} second(s) before using \`/${commandName}\` again.`
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    reply();
  };
};

/**
 * Guild-only command handler
 */
export const handleGuildOnly = (
  interaction: ChatInputCommandInteraction,
  commandName: string
): IO<void> => {
  const embed = createErrorEmbed(
    "Guild Only",
    `The \`/${commandName}\` command can only be used in servers.`
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    reply();
  };
};

/**
 * Owner-only command handler
 */
export const handleOwnerOnly = (
  interaction: ChatInputCommandInteraction,
  commandName: string
): IO<void> => {
  const embed = createErrorEmbed(
    "Owner Only",
    `The \`/${commandName}\` command is only available to bot owners.`
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    reply();
  };
};

/**
 * Missing permissions handler
 */
export const handleMissingPermissions = (
  interaction: ChatInputCommandInteraction,
  commandName: string,
  _requiredPermissions: string[]
): IO<void> => {
  const embed = createErrorEmbed(
    "Missing Permissions",
    `You don't have the required permissions to use \`/${commandName}\`.`
  );
  const reply = replyWithEmbed(interaction, embed, true);
  
  return () => {
    reply();
  };
};
