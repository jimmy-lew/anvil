<script setup lang="ts">
const isOpen = ref(false)

const log_header = useTemplateRef('log_header')
const log_list = useTemplateRef('log_list')

const { log_display: logs, toggle_pause } = useLogs()
const { isFiltersActive, toggle_filters } = useLogFilters()

function handle_scroll() {
  if (!log_header.value || !log_list.value)
    return
  log_header.value.scrollLeft = log_list.value.scrollLeft
}

defineShortcuts({
  'escape': () => isOpen.value = false,
  '[': () => toggle_filters(),
  ']': () => isOpen.value = !isOpen.value,
  ' ': () => toggle_pause(),
})
</script>

<template>
  <div class="flex h-full relative overflow-hidden">
    <Motion
      :initial="{ width: '270px', opacity: 1 }"
      :animate="{ width: isFiltersActive ? '270px' : '0px', opacity: isFiltersActive ? 1 : 0 }"
      :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
      class="border-r dark:bg-black overflow-hidden"
    >
      <div class="w-[270px] h-full">
        <LogFilters />
      </div>
    </Motion>
    <div class="flex flex-col relative h-full overflow-hidden flex-1 min-w-0">
      <div class="absolute top-[calc(--header-height+8px)] z-50 w-full bg-background flex flex-col items-stretch justify-start flex-initial border-b overflow-x-auto">
        <div class="px-3 pt-3">
          <LogSearch />
          <LogChart range="6h" />
          <div ref="log_header" class="max-w-screen overflow-x-hidden no-scrollbar">
            <div class="flex flex-row items-center justify-stretch flex-initial text-base h-10 min-w-4xl">
              <div class="pl-5 w-53">
                Time
              </div>
              <div class="w-18">
                Level
              </div>
              <div class="">
                Message
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref="log_list" class="pt-36 h-full overflow-x-auto md:overflow-x-hidden overflow-y-auto relative"
          @scroll.passive="handle_scroll"
        >
          <ol class="flex flex-col items-stretch justify-start flex-auto px-1 min-w-4xl h-full">
            <LogItem
              v-for="(log_item, index) in logs" :key="log_item.log_id" :item="log_item" :index
              @select="isOpen = true"
            />
          </ol>

          <LogItemSidebar v-model:open="isOpen" />
        </div>
      </div>

      <LogPanel v-model:open="isOpen" />
    </div>
  </div>
</template>

<style scoped>
</style>
