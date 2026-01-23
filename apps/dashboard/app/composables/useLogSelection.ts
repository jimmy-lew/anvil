export function useLogSelection() {
  const { log_display } = useLogs()
  const pointer = useState('log-pointer', () => 0)

  const selectedItem = computed<RawLogItem | undefined>(() => {
    if (log_display.value.length === 0)
      return undefined

    // Clamp pointer to be within valid bounds
    if (pointer.value >= log_display.value.length)
      pointer.value = log_display.value.length - 1
    if (pointer.value < 0)
      pointer.value = 0

    return log_display.value[pointer.value]
  })

  const is_max = computed(() => pointer.value === (log_display.value.length - 1))
  const is_min = computed(() => pointer.value === 0)

  function selectItem(index: number) {
    if (index >= 0 && index < log_display.value.length)
      pointer.value = index
  }

  const increasePointer = () => !is_max.value && pointer.value++
  const decreasePointer = () => !is_min.value && pointer.value--

  return {
    selectedItem,
    selectItem,
    increasePointer,
    decreasePointer,
    is_max,
    is_min,
  }
}
