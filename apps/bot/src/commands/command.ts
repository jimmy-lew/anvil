import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  PermissionsString,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js'
import type { RateLimiter } from 'discord.js-rate-limiter'

export interface Command {
  cooldown?: RateLimiter
  defer: CommandDeferType
  perms: PermissionsString[]
  metadata: RESTPostAPIApplicationCommandsJSONBody
  autocomplete?: (
    intr: AutocompleteInteraction,
    option: AutocompleteFocusedOption,
  ) => Promise<ApplicationCommandOptionChoiceData[]>
  execute: (intr: any) => Promise<void>
}

export enum CommandDeferType {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  NONE = 'NONE',
}
