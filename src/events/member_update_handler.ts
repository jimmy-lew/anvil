import type { PartialUser, User } from 'discord.js'
import { Events } from 'discord.js'

import { logger } from '../logger'
import { EventHandler } from './index.js'

export default class GuildMemberJoinHandler extends EventHandler {
  event_name = [Events.UserUpdate]

  public async process(event: Events, prev: PartialUser | User, cur: User): Promise<void> {
    const is_self = cur.id === cur.client.user?.id
    if (is_self)
      return

    if (prev.partial) {
      //
    }

    const pfp_updated = prev.avatarURL() !== cur.avatarURL()
    logger.trace({ user_id: cur.id, pfp_updated }, 'User profile updated')
  }
}
