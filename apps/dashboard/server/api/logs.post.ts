import type { RawLogItem } from '~/types/log'

export default defineEventHandler(async (event) => {
  const body = await readBody<RawLogItem>(event)
  cache_log(body)
  return { success: true }
})
