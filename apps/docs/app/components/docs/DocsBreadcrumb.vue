<script setup lang="ts">
function partToLabelItem(part: string) {
  return { label: part.split('-').join(' ') }
}

const route = useRoute()
const items = computed(() => route.path.split('/').slice(2).map(partToLabelItem))
</script>

<template>
  <UBreadcrumb
    :items="items"
    :ui="{
      linkLabel: 'first-letter:uppercase',
    }"
  >
    <template #separator>
      <span class="mx-2 text-muted">/</span>
    </template>
  </UBreadcrumb>
</template>
