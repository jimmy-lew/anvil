export const useLogStream = createSharedComposable((cap: number = 1000) => {
  const buffer = useState('logs-buffer', () => shallowRef<RawLogItem[]>([]))
  const bg_count = computed(() => buffer.value.length)

  const { data: cache } = useAsyncData<RawLogItem[]>('log-cache', () => ($fetch as any)('/api/logs'), {
    getCachedData: (k, a) => a.payload.data[k] || a.static.data[k],
  })

  watch(cache, (data) => {
    if (buffer.value.length !== 0 || !data || !Array.isArray(data))
      return
    buffer.value = data
  }, { immediate: true })

  const { data } = useEventSource('/api/stream/logs')

  watch(data, (new_data) => {
    if (!new_data)
      return
    try {
      const parsed = JSON.parse(new_data)
      buffer.value = [parsed, ...buffer.value].slice(0, cap)
    }
    catch { }
  })

  return { buffer, bg_count }
})

export function useLogFilters() {
  const isFiltersActive = useState('log-filters-active', () => true)

  const toggle_filters = () => { isFiltersActive.value = !isFiltersActive.value }

  return {
    isFiltersActive,
    toggle_filters,
  }
}

function _useLogs(cap: number = 1000) {
  const { buffer, bg_count } = useLogStream(cap)

  const pause_count = ref(0)
  const is_paused = useState('logs-paused', () => false)

  const log_display = computed(() => {
    return (is_paused.value ? buffer.value.slice(bg_count.value - pause_count.value) : buffer.value).filter((_) => {
      return true
    })
  })

  const toggle_pause = () => {
    is_paused.value = !is_paused.value
    if (is_paused.value) {
      pause_count.value = buffer.value.length
    }
  }

  return {
    is_paused,
    toggle_pause,
    log_display,
  }
}

export const useLogs = createSharedComposable(_useLogs)
