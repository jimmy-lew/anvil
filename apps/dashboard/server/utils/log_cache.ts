import type { RawLogItem } from '~/types/log'

const cache: RawLogItem[] = []
const MAX_CAPACITY = 500

export const fetch_log_cache = () => cache

export function cache_log(log: RawLogItem) {
  cache.unshift(log)
  if (cache.length > MAX_CAPACITY) {
    cache.pop()
  }
}

export function clear_log_cache() {
  cache.length = 0
}
