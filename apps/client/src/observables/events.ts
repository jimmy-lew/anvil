/**
 * Discord Events as RxJS Observables
 * 
 * This module converts Discord.js EventEmitter events to RxJS Observables
 * This enables:
 * - Composition of event streams
 * - Operators like filter, map, debounce
 * - Multiple subscribers to same events
 * - Automatic cleanup on unsubscribe
 */

import { Client, Events, type Message, type ChatInputCommandInteraction, type Guild } from "discord.js";
import { Observable, Subject, fromEvent, merge, type ObservableInput } from "rxjs";
import { map, filter, shareReplay, takeUntil, distinctUntilChanged } from "rxjs/operators";

/**
 * Event observable factory
 * Converts Discord client events to Observables
 */
export const fromDiscordEvent = <T>(
  client: Client,
  event: string
): Observable<T> => 
  fromEvent(client, event) as Observable<T>;

/**
 * Message create event observable
 */
export const messageCreate$ = (client: Client): Observable<Message> => 
  fromEvent(client, Events.MessageCreate as string) as Observable<Message>;

/**
 * Interaction create event observable (for slash commands)
 */
export const interactionCreate$ = (client: Client): Observable<ChatInputCommandInteraction> => 
  fromEvent(client, Events.InteractionCreate as string) as Observable<ChatInputCommandInteraction>;

/**
 * Ready event observable
 */
export const ready$ = (client: Client): Observable<void> => 
  fromEvent(client, Events.ClientReady as string) as Observable<void>;

/**
 * Guild create event observable
 */
export const guildCreate$ = (client: Client): Observable<Guild> => 
  fromEvent(client, Events.GuildCreate as string) as Observable<Guild>;

/**
 * Guild delete event observable
 */
export const guildDelete$ = (client: Client): Observable<Guild> => 
  fromEvent(client, Events.GuildDelete as string) as Observable<Guild>;

/**
 * Error event observable
 */
export const error$ = (client: Client): Observable<Error> => 
  fromEvent(client, Events.Error as string) as Observable<Error>;

/**
 * Warn event observable
 */
export const warn$ = (client: Client): Observable<string> => 
  fromEvent(client, Events.Warn as string) as Observable<string>;

/**
 * Filter messages by content
 */
export const filterByContent = (predicate: (content: string) => boolean) => 
  filter<Message>((msg) => predicate(msg.content));

/**
 * Filter messages by channel
 */
export const filterByChannel = (channelId: string) => 
  filter<Message>((msg) => msg.channelId === channelId);

/**
 * Filter messages by guild
 */
export const filterByGuild = (guildId: string) => 
  filter<Message>((msg) => msg.guildId === guildId);

/**
 * Filter messages from specific user
 */
export const filterByUser = (userId: string) => 
  filter<Message>((msg) => msg.author.id === userId);

/**
 * Filter bot messages
 */
export const filterBotMessages = 
  filter<Message>((msg) => msg.author.bot);

/**
 * Filter human messages (non-bot)
 */
export const filterHumanMessages = 
  filter<Message>((msg) => !msg.author.bot);

/**
 * Map message to content
 */
export const mapToContent = 
  map<Message, string>((msg) => msg.content);

/**
 * Map interaction to command name
 */
export const mapToCommandName = 
  map<ChatInputCommandInteraction, string>((interaction) => 
    interaction.commandName
  );

/**
 * Map interaction to options
 */
export const mapToInteractionOptions = 
  map<ChatInputCommandInteraction, Map<string, unknown>>((interaction) => {
    const options = new Map<string, unknown>();
    if (!interaction.options) return options;
    for (const option of interaction.options.data) {
      if (option.value !== undefined) {
        options.set(option.name, option.value);
      }
    }
    return options;
  });

/**
 * Subject for manual event emission (for testing or custom events)
 */
export const createEventSubject = <T>(): Subject<T> => new Subject<T>();

/**
 * Merge multiple observables into one
 */
export const mergeEvents = <T>(...sources: ObservableInput<T>[]): Observable<T> => 
  merge(...sources);

/**
 * Share observable among multiple subscribers
 * Important: without shareReplay, each subscriber would trigger a new event listener
 */
export const shareDiscordEvent = <T>(source: Observable<T>): Observable<T> => 
  source.pipe(shareReplay({ bufferSize: 0, refCount: true }));

/**
 * Take events until another observable emits
 */
export const takeUntilEvent = <T, U>(
  until: Observable<U>
) => 
  takeUntil<T>(until);

/**
 * Distinct events by key function
 */
export const distinctBy = <T, K>(
  keyFn: (value: T) => K
) => 
  distinctUntilChanged<T>((prev, curr) => keyFn(prev) === keyFn(curr));

/**
 * Create an observable that emits only once (for ready event)
 */
export const onceEvent = <T>(source: Observable<T>): Observable<T> => 
  new Observable<T>((subscriber) => {
    const subscription = source.subscribe({
      next: (value) => {
        subscriber.next(value);
        subscriber.complete();
      },
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete(),
    });
    return () => subscription.unsubscribe();
  });

/**
 * Compose all client events into a single observable
 */
export const allEvents$ = (client: Client): Observable<[string, unknown[]]> => 
  new Observable((subscriber) => {
    const handlers: (() => void)[] = [];
    
    const eventNames = [
      Events.MessageCreate as string,
      Events.InteractionCreate as string,
      Events.ClientReady as string,
      Events.GuildCreate as string,
      Events.GuildDelete as string,
      Events.Error as string,
      Events.Warn as string,
    ];
    
    for (const event of eventNames) {
      const handler = (...args: unknown[]) => {
        subscriber.next([event, args]);
      };
      client.on(event, handler);
      handlers.push(() => client.off(event, handler));
    }
    
    return () => {
      for (const cleanup of handlers) {
        cleanup();
      }
    };
  });

/**
 * Logger observable - logs all events to console
 */
export const logEvents = (_client: Client): Observable<void> => 
  new Observable<void>((_subscriber) => {
    // Implementation for logging
    return () => {};
  });

/**
 * Metrics observable - tracks event counts
 */
export const createMetrics = (_client: Client): Observable<Map<string, number>> => {
  const metrics = new Map<string, number>();
  
  return new Observable<Map<string, number>>((subscriber) => {
    const subscription = allEvents$(_client).subscribe(([event]) => {
      metrics.set(event, (metrics.get(event) ?? 0) + 1);
      subscriber.next(new Map(metrics));
    });
    
    return () => subscription.unsubscribe();
  });
};

/**
 * Buffer events over time windows
 */
export const bufferTime = <T>(
  client: Client,
  event: string,
  windowMs: number
): Observable<T[]> => {
  const source = fromDiscordEvent<T>(client, event);
  
  return new Observable<T[]>((subscriber) => {
    const buffer: T[] = [];
    
    const subscription = source.subscribe((value) => {
      buffer.push(value);
    });
    
    const interval = setInterval(() => {
      if (buffer.length > 0) {
        subscriber.next([...buffer]);
        buffer.length = 0;
      }
    }, windowMs);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  });
};
