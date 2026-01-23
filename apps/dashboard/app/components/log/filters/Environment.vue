<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

const isOpen = ref(false)
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    class="flex flex-col gap-2"
  >
    <div class="flex items-center justify-start gap-2">
      <CollapsibleTrigger as-child>
        <Button variant="ghost" class="w-full flex justify-start">
          <ChevronRight />
          <span class="sr-only">Toggle</span>
          <h4 class="text-sm font-semibold">
            Environment
          </h4>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="flex flex-col gap-2">
      <div class="rounded-md border px-4 py-2 font-mono text-sm">
        @radix-ui/colors
      </div>
      <div class="rounded-md border px-4 py-2 font-mono text-sm">
        @stitches/react
      </div>
    </CollapsibleContent>
  </Collapsible>
  <div />
</template>

<style scoped>

</style>
