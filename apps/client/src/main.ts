/**
 * Discord Bot - Main Entry Point
 * 
 * This file composes all the components together using:
 * - IO monad for side effects
 * - RxJS Observables for event streams
 * - Functional programming principles
 */

import { Client, Message, ChatInputCommandInteraction, Guild } from "discord.js";
import { fromEvent, Subject } from "rxjs";
import { loadConfig } from "./core/config.js";
import { createDefaultClient, loginWithToken } from "./core/client.js";
import type { BotConfig } from "./core/types.js";
import { initializeCommands, createCommandObserver } from "./observers/command-observer.js";
import { EventSubscriptionManager, createReadyObserver } from "./observers/event-observer.js";
import { logStartup, logShutdown, error as logErrorEffect } from "./effects/logging.js";
import { run } from "./io/io.js";

/**
 * Event stream subjects for reactive event handling
 */
const messageSubject = new Subject<Message>();
const interactionSubject = new Subject<ChatInputCommandInteraction>();
const guildSubject = new Subject<{ type: "create" | "delete"; guild: Guild }>();
const readySubject = new Subject<void>();

/**
 * Initialize the bot
 */
const initializeBot = async (): Promise<void> => {
  console.log("Starting Discord Bot...");
  
  const configIO = loadConfig();
  const configResult = run(configIO);
  
  if (!configResult || typeof configResult === "object" && "left" in configResult) {
    console.error("Failed to load configuration");
    process.exit(1);
  }
  
  const config: BotConfig = (configResult as { _tag: "Right"; right: BotConfig }).right;
  
  run(logStartup());
  
  initializeCommands();
  
  const clientIO = createDefaultClient();
  const clientResult = run(clientIO);
  
  if (!clientResult) {
    console.error("Failed to create Discord client");
    process.exit(1);
  }
  
  const client = clientResult;
  
  const token = process.env.BOT_TOKEN;
  
  if (!token) {
    console.error("BOT_TOKEN environment variable is not set");
    process.exit(1);
  }
  
  setupEventStreams(client);
  
  const commandObserver = createCommandObserver(config);
  commandObserver.subscribe(interactionSubject);
  
  const eventManager = new EventSubscriptionManager(config);
  eventManager.subscribeToMessages(messageSubject);
  eventManager.subscribeToGuilds(guildSubject);
  eventManager.subscribeToReady(readySubject);
  
  const readyObserver = createReadyObserver();
  readyObserver.subscribe(readySubject);
  
  const loginResult = run(loginWithToken(client, token));
  
  if (!loginResult || typeof loginResult === "object" && "left" in loginResult) {
    console.error("Failed to login to Discord");
    process.exit(1);
  }
  
  console.log("Bot is connecting to Discord...");
};

/**
 * Set up event streams from Discord client
 */
const setupEventStreams = (client: Client): void => {
  fromEvent(client, "messageCreate" as string).subscribe({
    next: (msg: unknown) => {
      if (msg instanceof Message) {
        messageSubject.next(msg);
      }
    },
    error: (err: unknown) => {
      console.error("Error in message stream:", err);
    },
  });
  
  fromEvent(client, "interactionCreate" as string).subscribe({
    next: (interaction: unknown) => {
      if (interaction instanceof ChatInputCommandInteraction) {
        interactionSubject.next(interaction);
      }
    },
    error: (err: unknown) => {
      console.error("Error in interaction stream:", err);
    },
  });
  
  fromEvent(client, "guildCreate" as string).subscribe({
    next: (guild: unknown) => {
      if (guild instanceof Guild) {
        guildSubject.next({ type: "create", guild });
      }
    },
    error: (err: unknown) => {
      console.error("Error in guild create stream:", err);
    },
  });
  
  fromEvent(client, "guildDelete" as string).subscribe({
    next: (guild: unknown) => {
      if (guild instanceof Guild) {
        guildSubject.next({ type: "delete", guild });
      }
    },
    error: (err: unknown) => {
      console.error("Error in guild delete stream:", err);
    },
  });
  
  fromEvent(client, "ready" as string).subscribe({
    next: () => {
      readySubject.next();
      console.log("Ready event fired");
    },
    error: (err: unknown) => {
      console.error("Error in ready stream:", err);
    },
  });
  
  fromEvent(client, "error" as string).subscribe({
    next: (error: unknown) => {
      if (error instanceof Error) {
        console.error("Discord client error:", error);
      }
    },
  });
  
  fromEvent(client, "warn" as string).subscribe({
    next: (warn: unknown) => {
      if (typeof warn === "string") {
        console.warn("Discord warning:", warn);
      }
    },
  });
};

/**
 * Graceful shutdown handler
 */
const shutdown = async (): Promise<void> => {
  console.log("\nShutting down gracefully...");
  
  run(logShutdown());
  
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  console.log("Bot has been stopped.");
  process.exit(0);
};

/**
 * Handle uncaught errors
 */
const handleUncaughtError = (error: Error): void => {
  console.error("Uncaught error:", error);
  logErrorEffect("Uncaught error", error);
  process.exit(1);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", handleUncaughtError);
process.on("unhandledRejection", (reason: unknown) => {
  if (reason instanceof Error) {
    console.error("Unhandled rejection:", reason);
    logErrorEffect("Unhandled rejection", reason);
  }
});

initializeBot().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});
