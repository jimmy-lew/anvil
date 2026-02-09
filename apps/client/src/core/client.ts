/**
 * Discord.js Client Setup
 * 
 * Creates and configures the Discord client as an IO monad
 * This allows us to treat client initialization as a pure side effect
 * that can be composed with other IO actions
 */

import { Client, GatewayIntentBits, Partials } from "discord.js";
import type { IO } from "../io/io.js";
import type { DiscordClientOptions } from "./types.js";
import type { Either } from "../utils/either.js";
import { left, right } from "../utils/either.js";
import { flatMap } from "../io/io.js";

/**
 * Create Discord client with specified options
 * Returns IO<Client> to defer side effects
 */
export const createClient: (options: DiscordClientOptions) => IO<Client> = 
  (options) => () => {
    const client = new Client({
      intents: options.intents,
      partials: options.partials,
    });
    return client;
  };

/**
 * Create client with default intents for a bot
 * Default includes: Guilds, GuildMessages, MessageContent, GuildMembers
 */
export const createDefaultClient: () => IO<Client> = () => 
  createClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel as Partials],
  });

/**
 * Login to Discord with token
 * Returns IOEither<Error, Client> for proper error handling
 */
export const loginWithToken: (client: Client, token: string) => IO<Either<Error, Client>> = 
  (client, token) => () => {
    try {
      client.login(token);
      return right(client);
    } catch (error) {
      if (error instanceof Error) {
        return left(error);
      }
      return left(new Error(String(error)));
    }
  };

/**
 * Destroy the Discord client
 */
export const destroyClient: (client: Client) => IO<void> = 
  (client) => () => {
    client.destroy();
  };

/**
 * Get client ready state
 */
export const isReady: (client: Client) => IO<boolean> = 
  (client) => () => client.isReady();

/**
 * Get client user
 */
export const getClientUser: (client: Client) => IO<typeof client.user | null> = 
  (client) => () => client.user;

/**
 * Get client application ID
 */
export const getApplicationId: (client: Client) => IO<string | null> = 
  (client) => () => client.application?.id ?? null;

/**
 * Fetch application info
 * Returns IO that produces a Promise for async operation
 */
export const fetchApplicationInfo: (client: Client) => IO<Promise<unknown>> = 
  (client) => () => client.application?.fetch() ?? Promise.reject(new Error("No application"));

/**
 * Composed client lifecycle operations
 */
export const setupAndLogin = (
  token: string,
  options?: DiscordClientOptions
): IO<Either<Error, Client>> => {
  const clientIO = options ? createClient(options) : createDefaultClient();
  
  return flatMap(clientIO, (client) => 
    loginWithToken(client, token)
  );
};

/**
 * Create a client event handler helper
 * Wraps the event subscription in IO
 */
export const onClientEvent: <T>(
  client: Client,
  event: string,
  listener: (...args: T[]) => void
) => IO<void> = 
  (client, event, listener) => () => {
    client.on(event, listener);
  };

/**
 * Wait for client to be ready
 * Returns IO that resolves when 'ready' event fires
 */
export const waitForReady: (client: Client) => IO<Promise<void>> = 
  (client) => () => 
    new Promise((resolve) => {
      if (client.isReady()) {
        resolve();
      } else {
        client.once("ready", () => resolve());
      }
    });
