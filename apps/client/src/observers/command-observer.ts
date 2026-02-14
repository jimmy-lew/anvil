/**
 * Command Observer
 * 
 * Subscribes to the interaction event stream and dispatches commands
 * Uses RxJS to process interactions in a reactive manner
 */

import { type ChatInputCommandInteraction } from "discord.js";
import { Observable, type Subscription } from "rxjs";
import type { IO } from "../io/io.js";
import type { BotConfig } from "../core/types.js";
import { 
  handlePing, 
  handleHelp, 
  handleInfo, 
  handleUnknown,
  handleCommandError 
} from "../handlers/commands.js";
import { error as logError } from "../effects/logging.js";

/**
 * Command registry - maps command names to handlers
 */
export type CommandHandler = (
  interaction: ChatInputCommandInteraction,
  config: BotConfig
) => IO<void>;

const commandRegistry: Map<string, CommandHandler> = new Map();

/**
 * Register a command handler
 */
export const registerCommand = (
  commandName: string,
  handler: CommandHandler
): void => {
  commandRegistry.set(commandName.toLowerCase(), handler);
};

/**
 * Get a command handler by name
 */
export const getCommandHandler = (
  commandName: string
): CommandHandler | undefined => {
  return commandRegistry.get(commandName.toLowerCase());
};

/**
 * Get all registered command names
 */
export const getRegisteredCommands = (): string[] => {
  return Array.from(commandRegistry.keys());
};

/**
 * Initialize default commands
 */
export const initializeCommands = (): void => {
  registerCommand("ping", handlePing);
  registerCommand("help", handleHelp);
  registerCommand("info", handleInfo);
};

/**
 * Command observer - processes interactions and dispatches to handlers
 */
export const createCommandObserver = (
  config: BotConfig
): {
  subscribe: (observable: Observable<ChatInputCommandInteraction>) => Subscription;
  unsubscribe: () => void;
} => {
  let subscription: Subscription | null = null;
  
  const subscribe = (
    observable: Observable<ChatInputCommandInteraction>
  ): Subscription => {
    subscription = observable.subscribe({
      next: async (interaction) => {
        try {
          // Check if interaction is already replied/deferred
          if (interaction.replied || interaction.deferred) {
            return;
          }
          
          const commandName = interaction.commandName;
          const handler = getCommandHandler(commandName);
          
          if (handler) {
            const handlerIO = handler(interaction, config);
            handlerIO();
          } else {
            const unknownIO = handleUnknown(interaction, config);
            unknownIO();
          }
        } catch (err) {
          const commandName = interaction.commandName;
          logError(`Error handling command ${commandName}`, err);
          const errorIO = handleCommandError(
            interaction,
            err,
            commandName
          );
          errorIO();
        }
      },
      error: (err) => {
        logError("Command observer error:", err);
      },
      complete: () => {
        console.log("[Observer] Command stream completed");
      },
    });
    
    return subscription;
  };
  
  const unsubscribe = (): void => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  };
  
  return { subscribe, unsubscribe };
};

/**
 * Process a single command (for testing or manual invocation)
 */
export const processCommand = (
  interaction: ChatInputCommandInteraction,
  config: BotConfig
): IO<void> => {
  return () => {
    const commandName = interaction.commandName;
    const handler = getCommandHandler(commandName);
    
    if (handler) {
      const handlerIO = handler(interaction, config);
      handlerIO();
    } else {
      const unknownIO = handleUnknown(interaction, config);
      unknownIO();
    }
  };
};

/**
 * Command subscription manager
 */
export class CommandSubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private config: BotConfig;
  
  constructor(config: BotConfig) {
    this.config = config;
  }
  
  /**
   * Subscribe to an observable for a specific command
   */
  subscribeCommand(
    commandName: string,
    observable: Observable<ChatInputCommandInteraction>
  ): void {
    const handler = getCommandHandler(commandName);
    if (!handler) {
      console.warn(`[Observer] No handler registered for command: ${commandName}`);
      return;
    }
    
    const subscription = observable.subscribe({
      next: (interaction) => {
        const handlerIO = handler(interaction, this.config);
        handlerIO();
      },
      error: (err) => {
        logError(`Error in command subscription for ${commandName}:`, err);
      },
    });
    
    this.subscriptions.set(commandName, subscription);
  }
  
  /**
   * Unsubscribe from a specific command
   */
  unsubscribeCommand(commandName: string): void {
    const subscription = this.subscriptions.get(commandName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(commandName);
    }
  }
  
  /**
   * Unsubscribe from all commands
   */
  unsubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }
  
  /**
   * Get count of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}
