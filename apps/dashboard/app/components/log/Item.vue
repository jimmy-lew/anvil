<script setup lang="ts">
const props = defineProps<{ item: RawLogItem, index: number }>()
const emit = defineEmits(['select'])

const { selectItem } = useLogSelection()
const { get_label } = useLogLabel()

function parse(item: RawLogItem) {
  let msg = item.msg ?? item.content ?? item.event_name
  if (msg === 'NULL' || msg === '') {
    if (item.attachments) {
      msg = '<Attachment>'
    }
    else {
      msg = 'No message'
    }
  }
  const parsed = {
    level: item.level,
    level_label: get_label(item.level),
    date: new Date(item.time),
    msg,
    metadata: {} as Record<string, unknown>,
  }
  for (const [key, prop] of Object.entries(item)) {
    if (['level', 'time', 'msg'].includes(key))
      continue
    parsed.metadata[key] = prop
  }
  return parsed
}

const item = parse(props.item)

function handle_item_select() {
  emit('select', props.index)
  selectItem(props.index)
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: -20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3, delay: Math.min(index, 20) * 0.05 }"
    class="flex h-fit bg-[#111] odd:bg-transparent rounded-[8px] px-0 justify-start w-full"
  >
    <Button variant="ghost" class="w-full h-full justify-start rounded-[8px] px-0" @click="handle_item_select">
      <div class="flex flex-row flex-initial text-muted-foreground text-sm md:text-base text-left md:py-1 pl-7 ">
        <div class="flex items-center space-x-3 w-48">
          <span>
            {{ item.date.toLocaleDateString("en-SG", { month: 'short' }).toLocaleUpperCase() }}
          </span>
          <span>
            {{ item.date.toLocaleDateString("en-SG", { day: '2-digit' }) }}
          </span>
          <span class="flex text-white">
            {{ item.date.toLocaleTimeString('en-SG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}.
            <span class="text-muted-foreground">
              {{ item.date.toLocaleTimeString("en-SG", { fractionalSecondDigits: 2 }) }}
            </span>
          </span>
        </div>
        <div class="w-18 uppercase font-bold" :class="item.level_label.color">
          {{ item.level_label.label }}
        </div>
        <div class="">
          {{ item.msg }}
        </div>
      </div>
    </Button>
  </Motion>
</template>

<style scoped>

</style>
