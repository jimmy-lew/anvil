<script setup lang="ts">
import { ChevronDownIcon } from 'lucide-vue-next'

const isOpen = defineModel('open', { type: Boolean, default: false })
const isPanelOpen = ref(false)

const { isFiltersActive } = useLogFilters()

defineShortcuts({
  '\\': () => isPanelOpen.value = !isPanelOpen.value,
})
</script>

<template>
  <Motion
    :animate="{
      height: isPanelOpen ? 360 : 50,
      left: isFiltersActive ? 270 : 8,
      y: isOpen ? 0 : 360,
    }"
    :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    class="fixed block bottom-0 right-(--sb-width) border-t bg-background overflow-hidden"
  >
    <div class="flex h-full flex-1 flex-col sm:flex-initial">
      <div class="flex items-center justify-between border-b p-2 bg-background">
        <span class="px-3 py-1.5">Logs</span>
        <Button variant="ghost" size="icon" @click="isPanelOpen = !isPanelOpen">
          <ChevronDownIcon :size="16" class="" />
        </Button>
      </div>
      <div
        v-if="isPanelOpen"
        class="flex h-full items-center justify-center bg-black p-8 text-sm text-muted-foreground"
      >
        No items found
      </div>
    </div>
  </Motion>
</template>
