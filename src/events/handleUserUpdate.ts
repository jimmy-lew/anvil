import type { PartialUser, User } from 'discord.js'
import type { EventRecord } from './index'
import { Events } from 'discord.js'

import { EventHandler } from './index'

export default class UserUpdateHandler extends EventHandler {
  event_name = [Events.UserUpdate]

  public async process(event: Events, event_record: EventRecord, prev: PartialUser | User, cur: User): Promise<void> {
    const is_self = cur.id === cur.client.user?.id
    if (is_self)
      return

    if (prev.partial) {
      prev = await prev.fetch()
    }

    // const pfp_updated = prev.avatarURL() !== cur.avatarURL()
    // logger.trace({ user_id: cur.id, pfp_updated }, 'User profile updated')
  }
}
