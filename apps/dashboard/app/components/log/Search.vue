<script setup lang="ts">
import { CircleStopIcon, EllipsisVerticalIcon, FilterIcon, PlayCircleIcon, RefreshCwIcon, SearchIcon } from 'lucide-vue-next'

const { log_display: logs, is_paused } = useLogs()
const { toggle_filters } = useLogFilters()

const searchInput = ref()
const isOpen = ref(false)

defineShortcuts({
  'r': () => window.location.reload(),
  '/': () => {
    isOpen.value = true
    const el = searchInput.value?.$el as HTMLInputElement | undefined
    if (el)
      el.focus()
  },
})
</script>

<template>
  <div class="flex flex-col md:flex-row items-stretch justify-start flex-initial">
    <div class="flex flex-row items-stretch justify-start md:gap-2 flex-initial grow">
      <Button class="hidden md:inline-flex" variant="outline" size="icon" @click="toggle_filters">
        <FilterIcon />
      </Button>
      <LogDownload class="hidden md:inline-flex" />
      <Popover v-model:open="isOpen" class="relative">
        <PopoverAnchor as-child>
          <InputGroup>
            <InputGroupInput
              ref="searchInput"
              :placeholder="`${logs.length} logs found...`"
              @focus="isOpen = true"
              @click="isOpen = true"
              @keydown.escape="(e: KeyboardEvent) => {
                isOpen = false;
                (e.target as HTMLInputElement).blur()
              }"
            />
            <InputGroupAddon>
              <SearchIcon :size="16" />
              <!-- <LucideLoader2 :size="16" class="animate-spin" /> -->
            </InputGroupAddon>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          class="w-(--reka-popper-anchor-width)! bg-black border"
          @close-auto-focus.prevent
          @escape-key-down="() => {
            // Backup handler in case focus is not on input
            const el = searchInput?.$el as HTMLInputElement | undefined
            el?.blur()
          }"
        >
          Placeholder
        </PopoverContent>
      </Popover>
    </div>
    <div class="flex flex-row items-stretch justify-start gap-2 flex-initial">
      <Button class="md:hidden" variant="outline" size="icon">
        <FilterIcon />
      </Button>
      <LogDownload class="md:hidden" />
      <div class="flex-1 md:hidden" />
      <Button variant="outline" :class="!is_paused ? 'text-primary border-primary!' : ''">
        <CircleStopIcon v-if="!is_paused" />
        <PlayCircleIcon v-else />
        Live
      </Button>
      <Button variant="outline" size="icon">
        <!-- Used for when data might be stale and need to refresh connection to server -->
        <RefreshCwIcon />
      </Button>
      <Button variant="outline" size="icon">
        <EllipsisVerticalIcon />
      </Button>
    </div>
  </div>
</template>

<style scoped>

</style>
