<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

const memberCount = ref(0)

onMounted(() => {
  memberCount.value = 122
})
</script>

<template>
  <div class="flex justify-center items-center gap-2 pb-8">
    <UButton icon="lucide-book" variant="outline" color="neutral">
      Docs
    </UButton>
    <UButton to="" variant="outline" color="neutral" class="relative">
      Join the Smithy!
      <div class="absolute top-full left-2 mt-1 flex items-center justify-center gap-1 text-green-400">
        <UIcon name="lucide-circle-user-round" />
        <NumberFlow :value="memberCount" /> members
      </div>
    </UButton>
  </div>
</template>
