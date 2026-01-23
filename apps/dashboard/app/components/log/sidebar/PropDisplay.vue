<script setup lang="ts">
defineProps<{ item?: RawLogItem }>()
</script>

<template>
  <div v-if="item" class="flex flex-col border bg-[#0a0a0a] rounded">
    <div class="flex flex-col px-2 py-1">
      <div class="flex flex-col">
        <div v-for="([field, value], index) in Object.entries(item)" :key="index" class="border-b py-1 last:border-none">
          <Button variant="ghost" class="text-base w-full">
            <div class="flex items-center justify-between w-full gap-1">
              <span class="text-muted-foreground">{{ field }}</span>
              <span class="pl-8 truncate">{{ value }}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
