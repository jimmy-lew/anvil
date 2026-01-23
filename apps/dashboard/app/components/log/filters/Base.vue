<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  title: string
}>()

const isOpen = ref(true)
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
            {{ title }}
          </h4>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent
      class="
        flex flex-col
        text-base border mb-2 rounded
        data-[state=closed]:animate-collapsible-up
        data-[state=open]:animate-collapsible-down
        transition-all duration-100
        "
    >
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>

<style scoped>

</style>
