<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

const isOpen = ref(true)

const labels: Record<number, [string, string]> = {
  10: ['trace', 'text-stone-600'],
  20: ['debug', 'text-emerald-500'],
  30: ['info', 'text-sky-500'],
  40: ['warn', 'text-amber-600'],
  50: ['error', 'text-red-600'],
  60: ['fatal', 'text-violet-600'],
}
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    class="flex flex-col gap-2"
  >
    <div class="flex items-center justify-start gap-2">
      <CollapsibleTrigger as-child>
        <Button variant="ghost" class="w-full flex justify-start group">
          <ChevronRight class="group-data-[state=open]:rotate-90 transition-all duration-300 ease-in-out" />
          <span class="sr-only">Toggle</span>
          <h4 class="text-sm font-semibold">
            Log level
          </h4>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="flex flex-col text-base border mb-2 rounded data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down transition-all duration-100">
      <div v-for="(log_level, index) in labels" :key="index" class="flex items-center gap-3 py-1 px-2 not-last:border-b">
        <Checkbox id="trace" />
        <Label for="trace" class="leading-7 ml-1 capitalize">{{ log_level[0] }}</Label>
        <Badge variant="outline" class="text-[12px] leading-4 ml-auto min-w-6 h-6">
          0
        </Badge>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>

<style scoped>

</style>
