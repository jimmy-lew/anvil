import type { GuildMember, PartialGuildMember } from 'discord.js'
import type { EventRecord } from '@/events'
import { Events } from 'discord.js'

import { EventHandler } from '@/events'

export default class GuildMemberUpdateHandler extends EventHandler {
  event_name = [Events.GuildMemberUpdate]

  public async process(event: Events, event_record: EventRecord, prev: PartialGuildMember | GuildMember, cur: GuildMember): Promise<void> {
    const is_self = cur.id === cur.client.user?.id
    if (is_self)
      return
  }
}
