/* eslint-disable ts/ban-ts-comment */
import type { RateLimitData } from 'discord.js'
import type { ClientConfig } from '../config'
import type { EventHandler } from '../events'

import { Client, Events, Options, Partials, RESTEvents } from 'discord.js'
import { config } from '../config'
import { logger } from '../logger'

export class Anvil extends Client {
  constructor(
    opts: ClientConfig,
    private event_handlers: EventHandler[],
  ) {
    super({
      intents: opts.intents,
      partials: opts.partials.map(p => Partials[p]),
      makeCache: Options.cacheWithLimits({ ...Options.DefaultMakeCacheSettings, ...opts.caches }),
      enforceNonce: true,
    })
  }

  public async start(): Promise<void> {
    this.register_event_handlers()
    await this.login(config.client.token)
  }

  private register_event_handlers(): void {
    this.on(Events.ClientReady, this.on_ready)

    for (const event_handler of this.event_handlers) {
      logger.debug(`Registering ${event_handler.event_name}...`)
      // @ts-expect-error
      event_handler.event_name.map((event: Events) => this.on(event, (...args) => event_handler._process(event, ...args)))
    }

    this.rest.on(RESTEvents.RateLimited, this.on_rate_limit)
  }

  private async on_ready(): Promise<void> {
    const userTag = this.user?.tag
    logger.info(`Client logged in as ${userTag}`)
    logger.info('Client is ready!')
  }

  private async on_rate_limit(data: RateLimitData): Promise<void> {
    if (data.timeToReset >= 30 * 1000) {
      logger.error(data, 'A rate limit was hit while making a request.')
    }
  }
}
