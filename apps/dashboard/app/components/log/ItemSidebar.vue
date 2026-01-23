<script setup lang="ts">
import { ChevronDown, ChevronUp, Circle, X } from 'lucide-vue-next'

const isOpen = defineModel('open', { type: Boolean, default: false })

const { selectedItem: item, is_max, is_min, increasePointer, decreasePointer } = useLogSelection()
const { get_label } = useLogLabel()

const date = computed(() => { return item.value ? new Date(item.value.time) : new Date() })
const level = computed(() => get_label(item.value?.level))

const attachments = computed(() => {
  if (item.value?.attachments === 'NULL') {
    return []
  }
  return item.value.attachments.split(',').map(a => a.trim()).filter(a => a)
})

function openAttachment(url: string) {
  window.open(url, '_blank')
}

defineShortcuts({
  ArrowDown: increasePointer,
  ArrowUp: decreasePointer,
})
</script>

<template>
  <Motion
    :initial="{ x: '100%' }"
    :animate="{ x: isOpen ? 0 : '100%' }"
    :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    class="fixed top-50 right-0 bottom-0 bg-black border-l w-(--sb-width) flex flex-col"
  >
    <div class="flex flex-row justify-between bg-black p-4">
      <div class="flex items-center justify-center gap-1 p-1">
        Log
      </div>
      <div class="flex flex-row items-center justify-start gap-2 flex-initial">
        <Badge v-if="item" :class="level.color" class="font-bold rounded uppercase" variant="outline">
          {{ level.label }}
        </Badge>
        <div v-if="item" class="flex flex-row gap-1">
          <Button :disabled="is_max" :class="is_max ? 'text-muted' : ''" size="icon" variant="ghost" @click="increasePointer">
            <ChevronDown />
          </Button>
          <Button :disabled="is_min" :class="is_min ? 'text-muted' : ''" size="icon" variant="ghost" @click="decreasePointer">
            <ChevronUp />
          </Button>
        </div>
        <Separator orientation="vertical" />
        <Button size="icon" variant="ghost" @click="isOpen = false">
          <X />
        </Button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto group-data-[collapsible=icon]:overflow-hidden bg-black">
      <div class="flex flex-col items-stretch justify-start flex-initial pb-4">
        <div class="flex-1 px-3 flex flex-col">
          <div v-if="item">
            <div class="ml-1 flex items-center justify-between gap-2 p-1">
              <div class="flex items-center px-2 space-x-0.5 font-medium">
                <Circle :size="10" />
                <span class="text-base text-nowrap p-1">Log created</span>
              </div>
              <LogSidebarRichDate :date />
            </div>

            <LogSidebarPropDisplay :item />

            <div v-if="attachments.length" class="mt-4">
              <h3 class="text-sm font-medium mb-2">
                Attachments
              </h3>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="attachment in attachments" :key="attachment" class="relative">
                  <img :src="attachment" alt="Attachment" class="w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity" @click="openAttachment(attachment)">
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center h-full min-h-[64vh]">
            <p class="font-medium">
              No log selected
            </p>
            <p class="text-sm">
              Select a log from the list to view details.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Motion>
</template>

<style scoped>
</style>
