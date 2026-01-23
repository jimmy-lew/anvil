<script setup lang="ts">
import { Calendar, ChevronDown, ChevronRight } from 'lucide-vue-next'

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
            Timeline
          </h4>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="flex flex-col text-base mb-2">
      <ButtonGroup class="w-full rounded">
        <Button variant="outline" size="icon" class="rounded">
          <Calendar />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger class="relative inline-flex w-full">
            <Button variant="outline" class="w-full justify-start rounded rounded-l-none">
              Last day
              <ChevronDown class="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent />
        </DropdownMenu>
      </ButtonGroup>
    </CollapsibleContent>
  </Collapsible>
</template>

<style scoped>

</style>
