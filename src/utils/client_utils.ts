import type { Guild, Role } from 'discord.js'

const is_discord_id = (input: string) => input.match(/\b\d{17,20}\b/)?.[0]
const discord_tag = (input: string) => {
  const match = input.match(/\b(.+)#(\d{4})\b/)
  if (!match) return
  const [tag, username, discriminator] = match
  return { tag, username, discriminator }
}

export const find_member = async (guild: Guild, input: string) => {
  const discord_id = is_discord_id(input)
  if (discord_id) return (await guild.members.fetch(discord_id))

  const tag = discord_tag(input)
  if (!tag) return (await guild.members.fetch({query: input, limit: 1})).first()
  return (await guild.members.fetch({query: tag.username, limit: 20})).find(member => member.user.discriminator === tag.discriminator)
}

export const find_role = async (guild: Guild, input: string) => {
  const discord_id = is_discord_id(input)
  if (discord_id) return (await guild.roles.fetch(discord_id))
  
  const search_term = input.trim().toLowerCase().replace(/^@/, '')
  const roles: [Role, string][] = (await guild.roles.fetch()).map(role => [role, role.name.toLowerCase()])
  const [hit, _] = roles.find(([_, role]) => role === search_term) ?? roles.find(([_, role]) => role.includes(search_term))
  return hit
}
