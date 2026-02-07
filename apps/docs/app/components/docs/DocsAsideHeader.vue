<script setup lang="ts">
const { localePath } = useInternalI18n()
</script>

<template>
  <header class="flex items-center justify-between min-h-(--ui-header-height) border-b border-default pl-7 pr-4">
    <div class="flex items-center gap-2">
      <AppHeaderLogo class="h-5 w-auto shrink-0" />
      <div class="border-muted h-6 border-solid border-s" />
      <ULink :to="localePath('/')" class="text-highlighted font-medium hover:text-muted">
        Docs
      </ULink>
    </div>
    <UContentSearchButton variant="subtle" size="sm" />
  </header>
</template>
