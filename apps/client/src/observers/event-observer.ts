/**
 * Event Observer
 * 
 * Subscribes to Discord event streams and dispatches to handlers
 * Uses RxJS Observables for reactive event processing
 */

import { type Message, type Guild } from "discord.js";
import { Observable, type Subscription } from "rxjs";
import type { BotConfig } from "@/core";
import {
  handleReady,
  handleMessageCreate,
  handleGuildCreate,
  handleGuildDelete,
  handleError,
} from "@/handlers";
import { error as logError } from "@/effects";

/**
 * Message event observer
 */
export const createMessageObserver = (
  config: BotConfig
): {
  subscribe: (observable: Observable<Message>) => Subscription;
  unsubscribe: () => void;
} => {
  let subscription: Subscription | null = null;
  
  const subscribe = (observable: Observable<Message>): Subscription => {
    subscription = observable.subscribe({
      next: (message) => {
        try {
          if (message.author.bot) return;
          const messageIO = handleMessageCreate(message, config);
          messageIO();
        } catch (err) {
          logError("Error handling message:", err);
        }
      },
      error: (err) => {
        logError("Message observer error:", err);
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
 * Guild event observer
 */
export const createGuildObserver = (
  config: BotConfig
): {
  subscribe: (observable: Observable<{ type: "create" | "delete"; guild: Guild }>) => Subscription;
  unsubscribe: () => void;
} => {
  let subscription: Subscription | null = null;
  
  const subscribe = (
    observable: Observable<{ type: "create" | "delete"; guild: Guild }>
  ): Subscription => {
    subscription = observable.subscribe({
      next: (event) => {
        try {
          if (event.type === "create") {
            const guildIO = handleGuildCreate(event.guild, config);
            guildIO();
          } else {
            const guildIO = handleGuildDelete(event.guild, config);
            guildIO();
          }
        } catch (err) {
          logError(`Error handling guild ${event.type} event:`, err);
        }
      },
      error: (err) => {
        logError("Guild observer error:", err);
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
 * Error observer
 */
export const createErrorObserver = (): {
  subscribe: (observable: Observable<Error>) => Subscription;
  unsubscribe: () => void;
} => {
  let subscription: Subscription | null = null;
  
  const subscribe = (observable: Observable<Error>): Subscription => {
    subscription = observable.subscribe({
      next: (error) => {
        const errorIO = handleError(error);
        errorIO();
      },
      error: (err) => {
        logError("Error observer error:", err);
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
 * Ready event observer
 */
export const createReadyObserver = (): {
  subscribe: (observable: Observable<void>) => Subscription;
  unsubscribe: () => void;
} => {
  let subscription: Subscription | null = null;
  
  const subscribe = (observable: Observable<void>): Subscription => {
    subscription = observable.subscribe({
      next: () => {
        const readyIO = handleReady({});
        readyIO();
      },
      error: (err) => {
        logError("Ready observer error:", err);
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
 * Event subscription manager
 */
export class EventSubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private config: BotConfig;
  
  constructor(config: BotConfig) {
    this.config = config;
  }
  
  /**
   * Subscribe to a message observable
   */
  subscribeToMessages(
    observable: Observable<Message>
  ): void {
    const observer = createMessageObserver(this.config);
    const subscription = observer.subscribe(observable);
    this.subscriptions.set("messages", subscription);
  }
  
  /**
   * Subscribe to guild events
   */
  subscribeToGuilds(
    observable: Observable<{ type: "create" | "delete"; guild: Guild }>
  ): void {
    const observer = createGuildObserver(this.config);
    const subscription = observer.subscribe(observable);
    this.subscriptions.set("guilds", subscription);
  }
  
  /**
   * Subscribe to errors
   */
  subscribeToErrors(
    observable: Observable<Error>
  ): void {
    const observer = createErrorObserver();
    const subscription = observer.subscribe(observable);
    this.subscriptions.set("errors", subscription);
  }
  
  /**
   * Subscribe to ready event
   */
  subscribeToReady(
    observable: Observable<void>
  ): void {
    const observer = createReadyObserver();
    const subscription = observer.subscribe(observable);
    this.subscriptions.set("ready", subscription);
  }
  
  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(eventType: string): void {
    const subscription = this.subscriptions.get(eventType);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(eventType);
    }
  }
  
  /**
   * Unsubscribe from all events
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
